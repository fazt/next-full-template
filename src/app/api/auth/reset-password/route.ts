import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { apiError, parseJson } from "@/libs/api";
import { hashPassword } from "@/libs/password";
import { getClientIp, rateLimit } from "@/libs/rate-limit";
import { hashToken } from "@/libs/tokens";
import { resetPasswordSchema } from "@/libs/validations/auth";

const INVALID_TOKEN = "El enlace no es válido o ya caducó. Solicita uno nuevo.";

export async function POST(request: Request) {
  const limit = rateLimit(`reset:${getClientIp(request)}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.success) return apiError(429, "Demasiados intentos, prueba más tarde");

  const parsed = await parseJson(request, resetPasswordSchema);
  if ("response" in parsed) return parsed.response;
  const { token, password } = parsed.data;

  const passwordHash = await hashPassword(password);
  const now = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    const record = await tx.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!record) return false;

    // Marca el token como usado de forma atómica (evita dos usos simultáneos)
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (claimed.count === 0) return false;

    await tx.user.update({ where: { id: record.userId }, data: { password: passwordHash } });
    await tx.passwordResetToken.deleteMany({
      where: { userId: record.userId, id: { not: record.id } },
    });
    return true;
  });

  if (!updated) return apiError(400, INVALID_TOKEN, { token: [INVALID_TOKEN] });

  return NextResponse.json({ message: "Tu contraseña se actualizó. Ya puedes iniciar sesión." });
}
