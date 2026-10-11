import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/libs/api";
import { isPushEnabled, sendPush } from "@/libs/push";
import { rateLimit } from "@/libs/rate-limit";

// POST /api/push/test: notificación de prueba a los dispositivos del usuario
export async function POST() {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;
  if (!isPushEnabled()) return apiError(503, "Las notificaciones push no están configuradas en el servidor");

  const limit = rateLimit(`push-test:${auth.user.id}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!limit.success) return apiError(429, "Demasiadas pruebas seguidas, espera unos minutos");

  const result = await sendPush(
    { userId: auth.user.id },
    { title: "Notificación de prueba", body: "Las notificaciones push funcionan correctamente.", url: "/dashboard/settings" },
  );
  return NextResponse.json({ data: result });
}
