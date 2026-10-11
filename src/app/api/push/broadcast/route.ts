import { NextResponse } from "next/server";
import { apiError, parseJson, requireApiUser } from "@/libs/api";
import { isPushEnabled, sendPush } from "@/libs/push";
import { pushMessageSchema } from "@/libs/validations/push";

// POST /api/push/broadcast (admin): envía una notificación a todas las suscripciones
export async function POST(request: Request) {
  const auth = await requireApiUser("ADMIN");
  if ("response" in auth) return auth.response;
  if (!isPushEnabled()) return apiError(503, "Las notificaciones push no están configuradas en el servidor");

  const parsed = await parseJson(request, pushMessageSchema);
  if ("response" in parsed) return parsed.response;
  const { title, body, url } = parsed.data;

  const result = await sendPush({}, { title, body, url: url || "/dashboard" });
  return NextResponse.json({ data: result });
}
