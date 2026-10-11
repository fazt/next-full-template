import { readFile } from "node:fs/promises";
import path from "node:path";
import { getUploadDir, MIME_BY_EXTENSION } from "@/libs/storage";

type Context = { params: Promise<{ path: string[] }> };

const SAFE_SEGMENT = /^[a-zA-Z0-9._-]+$/;

const notFound = () => new Response("Not found", { status: 404 });

// Sirve los archivos subidos con STORAGE_DRIVER=local.
// (Next solo sirve /public con los archivos que existían al hacer el build.)
export async function GET(_request: Request, { params }: Context) {
  const { path: segments } = await params;
  if (!segments.every((segment) => SAFE_SEGMENT.test(segment) && segment !== "..")) return notFound();

  const root = getUploadDir();
  const filePath = path.resolve(root, ...segments);
  if (!filePath.startsWith(root + path.sep)) return notFound();

  const contentType = MIME_BY_EXTENSION[path.extname(filePath).slice(1).toLowerCase()];
  if (!contentType) return notFound();

  try {
    const data = await readFile(filePath);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch {
    return notFound();
  }
}
