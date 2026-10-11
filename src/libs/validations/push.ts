import { z } from "./common";

// El servidor hace peticiones a este endpoint: solo HTTPS y sin IPs ni hosts
// locales, para que no se pueda usar como proxy hacia la red interna (SSRF).
const pushEndpointSchema = z
  .url({ protocol: /^https$/, error: "Endpoint de suscripción inválido" })
  .max(2048)
  .refine((value) => {
    const host = new URL(value).hostname;
    const isIp = /^[\d.]+$/.test(host) || host.includes(":");
    return !isIp && host !== "localhost" && !/\.(local|internal|localhost)$/.test(host);
  }, "Endpoint de suscripción inválido");

export const pushSubscriptionSchema = z.object({
  endpoint: pushEndpointSchema,
  keys: z.object({
    p256dh: z.string().min(1).max(512),
    auth: z.string().min(1).max(512),
  }),
});

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().max(2048),
});

export const pushMessageSchema = z.object({
  title: z.string().trim().min(1, "Escribe un título").max(80, "Máximo 80 caracteres"),
  body: z.string().trim().min(1, "Escribe un mensaje").max(240, "Máximo 240 caracteres"),
  url: z
    .string()
    .trim()
    .max(300)
    .refine((value) => value === "" || (value.startsWith("/") && !value.startsWith("//")), "Usa una ruta interna, p. ej. /dashboard"),
});

export type PushMessageInput = z.infer<typeof pushMessageSchema>;
