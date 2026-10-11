import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { apiError, parseJson, requireApiUser } from "@/libs/api";
import { isPushEnabled } from "@/libs/push";
import { pushSubscriptionSchema, pushUnsubscribeSchema } from "@/libs/validations/push";

const DISABLED = "Las notificaciones push no están configuradas en el servidor";

// POST /api/push/subscription: guarda la suscripción del navegador actual
export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;
  if (!isPushEnabled()) return apiError(503, DISABLED);

  const parsed = await parseJson(request, pushSubscriptionSchema);
  if ("response" in parsed) return parsed.response;
  const { endpoint, keys } = parsed.data;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh: keys.p256dh, auth: keys.auth, userId: auth.user.id },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userId: auth.user.id },
  });
  return NextResponse.json({ message: "Notificaciones activadas" }, { status: 201 });
}

// DELETE /api/push/subscription: elimina la suscripción del navegador actual
export async function DELETE(request: Request) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, pushUnsubscribeSchema);
  if ("response" in parsed) return parsed.response;

  await prisma.pushSubscription.deleteMany({
    where: { endpoint: parsed.data.endpoint, userId: auth.user.id },
  });
  return new NextResponse(null, { status: 204 });
}
