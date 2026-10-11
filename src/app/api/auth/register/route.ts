import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { apiError, isUniqueConstraintError, parseJson } from "@/libs/api";
import { hashPassword } from "@/libs/password";
import { getClientIp, rateLimit } from "@/libs/rate-limit";
import { registerSchema } from "@/libs/validations/auth";

const EMAIL_TAKEN = "Ya existe una cuenta con ese correo";

export async function POST(request: Request) {
  const limit = rateLimit(`register:${getClientIp(request)}`, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!limit.success) return apiError(429, "Demasiados intentos, prueba más tarde");

  const parsed = await parseJson(request, registerSchema);
  if ("response" in parsed) return parsed.response;
  const { name, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return apiError(409, EMAIL_TAKEN, { email: [EMAIL_TAKEN] });

  try {
    const user = await prisma.user.create({
      data: { name, email, password: await hashPassword(password) },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) return apiError(409, EMAIL_TAKEN, { email: [EMAIL_TAKEN] });
    throw error;
  }
}
