import { after, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { apiError, parseJson } from "@/libs/api";
import { resetPasswordEmail } from "@/libs/emails";
import { sendMail } from "@/libs/mail";
import { getClientIp, rateLimit } from "@/libs/rate-limit";
import { createPasswordResetToken, RESET_TOKEN_TTL_MINUTES } from "@/libs/tokens";
import { getAppUrl } from "@/libs/url";
import { forgotPasswordSchema } from "@/libs/validations/auth";

const GENERIC_MESSAGE =
  "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.";

export async function POST(request: Request) {
  const byIp = rateLimit(`forgot:ip:${getClientIp(request)}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!byIp.success) return apiError(429, "Demasiadas solicitudes, prueba más tarde");

  const parsed = await parseJson(request, forgotPasswordSchema);
  if ("response" in parsed) return parsed.response;
  const { email } = parsed.data;

  const byEmail = rateLimit(`forgot:email:${email}`, { limit: 3, windowMs: 15 * 60 * 1000 });
  const appUrl = getAppUrl(request);

  // El trabajo se hace después de responder: la respuesta es idéntica y tarda
  // lo mismo exista o no la cuenta (no revela qué correos están registrados).
  if (byEmail.success) {
    after(async () => {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      });
      if (!user) return;

      const token = await createPasswordResetToken(user.id);
      const url = `${appUrl}/auth/reset-password?token=${token}`;
      try {
        await sendMail({
          to: user.email,
          ...resetPasswordEmail({ name: user.name, url, minutes: RESET_TOKEN_TTL_MINUTES }),
        });
      } catch (error) {
        console.error("[mail] No se pudo enviar el correo de recuperación", error);
      }
    });
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
