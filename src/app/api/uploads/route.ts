import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/libs/api";
import { rateLimit } from "@/libs/rate-limit";
import {
  detectImageType,
  getMaxUploadBytes,
  saveFile,
  UPLOAD_FOLDERS,
  type UploadFolder,
} from "@/libs/storage";

// POST /api/uploads (multipart/form-data: file, folder?)
export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const limit = rateLimit(`upload:${auth.user.id}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!limit.success) return apiError(429, "Demasiadas subidas seguidas, espera unos minutos");

  const maxBytes = getMaxUploadBytes();
  const maxMb = Math.round(maxBytes / 1024 / 1024);
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes + 64 * 1024) {
    return apiError(413, `El archivo supera el máximo de ${maxMb} MB`, { file: [`Máximo ${maxMb} MB`] });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return apiError(400, "Se esperaba multipart/form-data con un campo file");
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return apiError(400, "Selecciona un archivo", { file: ["Selecciona un archivo"] });
  }
  if (file.size > maxBytes) {
    return apiError(413, `El archivo supera el máximo de ${maxMb} MB`, { file: [`Máximo ${maxMb} MB`] });
  }

  const folderValue = form.get("folder");
  const folder: UploadFolder = UPLOAD_FOLDERS.includes(folderValue as UploadFolder)
    ? (folderValue as UploadFolder)
    : "misc";

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = detectImageType(bytes);
  if (!contentType) {
    return apiError(415, "Formato no permitido. Usa JPG, PNG, WebP, GIF o AVIF", {
      file: ["Formato no permitido"],
    });
  }

  const saved = await saveFile({ bytes, contentType, folder });
  return NextResponse.json(
    { data: { ...saved, size: file.size, contentType } },
    { status: 201 },
  );
}
