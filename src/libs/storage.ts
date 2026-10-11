import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ObjectCannedACL, S3Client } from "@aws-sdk/client-s3";

// ─── Tipos permitidos ────────────────────────────────────────────────────

export const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
} as const;

export type ImageMimeType = keyof typeof IMAGE_EXTENSIONS;

export const MIME_BY_EXTENSION: Record<string, ImageMimeType> = Object.fromEntries(
  Object.entries(IMAGE_EXTENSIONS).map(([mime, ext]) => [ext, mime as ImageMimeType]),
);

export const UPLOAD_FOLDERS = ["avatars", "products", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export function getMaxUploadBytes() {
  return (Number(process.env.UPLOAD_MAX_SIZE_MB) || 5) * 1024 * 1024;
}

/**
 * Detecta el tipo real por la firma del archivo (magic bytes), sin confiar
 * en el Content-Type que manda el navegador. SVG queda fuera a propósito (XSS).
 */
export function detectImageType(bytes: Uint8Array): ImageMimeType | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (ascii(0, 8) === "\x89PNG\r\n\x1a\n") return "image/png";
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return "image/gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return "image/avif";
  return null;
}

// ─── Driver ──────────────────────────────────────────────────────────────

export type StorageDriver = "local" | "s3";

let warnedMissingS3 = false;

function isS3Configured() {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      (process.env.S3_REGION || process.env.S3_ENDPOINT),
  );
}

/** STORAGE_DRIVER=s3 usa el bucket; si faltan variables vuelve al disco local. */
export function getStorageDriver(): StorageDriver {
  if (process.env.STORAGE_DRIVER === "s3") {
    if (isS3Configured()) return "s3";
    if (!warnedMissingS3) {
      console.warn("[storage] STORAGE_DRIVER=s3 pero faltan variables S3_*: se usa el disco local.");
      warnedMissingS3 = true;
    }
  }
  return "local";
}

export function getUploadDir() {
  return path.resolve(process.env.UPLOAD_DIR || "uploads");
}

// ─── Guardado ────────────────────────────────────────────────────────────

type SaveFileInput = {
  bytes: Uint8Array;
  contentType: ImageMimeType;
  folder: UploadFolder;
};

export type SavedFile = { url: string; key: string; driver: StorageDriver };

export async function saveFile({ bytes, contentType, folder }: SaveFileInput): Promise<SavedFile> {
  const month = new Date().toISOString().slice(0, 7);
  const key = `${folder}/${month}/${randomBytes(16).toString("hex")}.${IMAGE_EXTENSIONS[contentType]}`;

  if (getStorageDriver() === "s3") return uploadToS3({ key, bytes, contentType });

  const filePath = path.join(getUploadDir(), key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, bytes);
  // Se sirve con src/app/uploads/[...path]/route.ts (funciona también tras el build)
  return { url: `/uploads/${key}`, key, driver: "local" };
}

const globalForS3 = globalThis as unknown as { s3Client: S3Client | undefined };

async function getS3Client() {
  if (!globalForS3.s3Client) {
    // Import dinámico: el SDK solo se carga si se usa el driver S3
    const { S3Client } = await import("@aws-sdk/client-s3");
    globalForS3.s3Client = new S3Client({
      region: process.env.S3_REGION || "us-east-1",
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }
  return globalForS3.s3Client;
}

function getS3PublicUrl(key: string) {
  const bucket = process.env.S3_BUCKET!;
  const base = process.env.S3_PUBLIC_URL?.replace(/\/+$/, "");
  if (base) return `${base}/${key}`;

  if (process.env.S3_ENDPOINT) {
    const endpoint = new URL(process.env.S3_ENDPOINT);
    return process.env.S3_FORCE_PATH_STYLE === "true"
      ? `${endpoint.origin}/${bucket}/${key}`
      : `${endpoint.protocol}//${bucket}.${endpoint.host}/${key}`;
  }
  return `https://${bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
}

async function uploadToS3({ key, bytes, contentType }: { key: string; bytes: Uint8Array; contentType: string }) {
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await getS3Client();
  // Spaces necesita ACL public-read; en buckets de AWS con ACL desactivadas usa S3_ACL=none
  const acl = process.env.S3_ACL ?? "public-read";

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
      ...(acl && acl !== "none" ? { ACL: acl as ObjectCannedACL } : {}),
    }),
  );

  return { url: getS3PublicUrl(key), key, driver: "s3" as const };
}
