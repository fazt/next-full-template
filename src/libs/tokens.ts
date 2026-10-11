import { createHash, randomBytes } from "node:crypto";
import prisma from "@/libs/prisma";

export const RESET_TOKEN_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TTL_MINUTES) || 60;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Crea un token de un solo uso e invalida los anteriores del usuario. */
export async function createPasswordResetToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({
      data: { userId, tokenHash: hashToken(token), expiresAt },
    }),
  ]);

  return token;
}

/** Devuelve el token si existe, no se usó y no caducó. */
export async function findValidResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date()) return null;
  return record;
}
