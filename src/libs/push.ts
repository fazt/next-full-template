import webpush from "web-push";
import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/libs/prisma";

export type PushPayload = { title: string; body: string; url?: string };

/** Push se activa solo con las dos claves VAPID (genéralas con `npm run vapid`). */
export function isPushEnabled() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export function getVapidPublicKey() {
  return isPushEnabled() ? process.env.VAPID_PUBLIC_KEY! : null;
}

let configured = false;

function configureWebPush() {
  if (configured) return true;
  if (!isPushEnabled()) return false;
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:admin@example.com",
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
    configured = true;
  } catch (error) {
    console.error("[push] Claves VAPID inválidas: las notificaciones quedan desactivadas", error);
  }
  return configured;
}

/** Envía una notificación a las suscripciones que cumplan `where`. */
export async function sendPush(where: Prisma.PushSubscriptionWhereInput, payload: PushPayload) {
  if (!configureWebPush()) return { sent: 0, failed: 0, removed: 0 };

  const subscriptions = await prisma.pushSubscription.findMany({ where });
  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        JSON.stringify(payload),
        { TTL: 60 * 60 },
      ),
    ),
  );

  // 404/410: la suscripción caducó o el usuario la revocó, se elimina
  const expired = subscriptions
    .filter((_, index) => {
      const result = results[index];
      const status = result.status === "rejected" ? (result.reason as { statusCode?: number }).statusCode : 0;
      return status === 404 || status === 410;
    })
    .map((subscription) => subscription.id);

  if (expired.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: expired } } });
  }

  const sent = results.filter((result) => result.status === "fulfilled").length;
  return { sent, failed: results.length - sent, removed: expired.length };
}
