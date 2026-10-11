import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getCurrentUser, type CurrentUser } from "@/libs/session";

export type FieldErrors = Record<string, string[] | undefined>;

export function apiError(status: number, error: string, fieldErrors?: FieldErrors) {
  return NextResponse.json({ error, ...(fieldErrors ? { fieldErrors } : {}) }, { status });
}

/** Lee y valida un cuerpo JSON con un esquema zod. */
export async function parseJson<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<{ data: z.output<S> } | { response: NextResponse }> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { response: apiError(415, "Se esperaba un cuerpo application/json") };
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: apiError(400, "El cuerpo no es un JSON válido") };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      response: apiError(400, "Datos inválidos", z.flattenError(result.error).fieldErrors as FieldErrors),
    };
  }
  return { data: result.data };
}

/** Exige sesión (y opcionalmente rol) en un route handler. */
export async function requireApiUser(
  role?: CurrentUser["role"],
): Promise<{ user: CurrentUser } | { response: NextResponse }> {
  const user = await getCurrentUser();
  if (!user) return { response: apiError(401, "Debes iniciar sesión") };
  if (role && user.role !== role) {
    return { response: apiError(403, "No tienes permisos para esta acción") };
  }
  return { user };
}

export function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function isNotFoundError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}
