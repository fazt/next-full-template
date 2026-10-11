import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { apiError, parseJson, requireApiUser } from "@/libs/api";
import { hashPassword, verifyPassword } from "@/libs/password";
import { rateLimit } from "@/libs/rate-limit";
import { changePasswordSchema } from "@/libs/validations/user";

const WRONG_PASSWORD = "La contraseña actual no es correcta";

// PATCH /api/profile/password
export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const limit = rateLimit(`password:${auth.user.id}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.success) return apiError(429, "Demasiados intentos, prueba más tarde");

  const parsed = await parseJson(request, changePasswordSchema);
  if ("response" in parsed) return parsed.response;
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: auth.user.id }, select: { password: true } });

  // Las cuentas creadas con Google pueden definir su primera contraseña sin la actual
  if (user?.password && !(await verifyPassword(currentPassword, user.password))) {
    return apiError(400, WRONG_PASSWORD, { currentPassword: [WRONG_PASSWORD] });
  }

  await prisma.user.update({
    where: { id: auth.user.id },
    data: { password: await hashPassword(newPassword) },
  });
  return NextResponse.json({ message: "Contraseña actualizada" });
}
