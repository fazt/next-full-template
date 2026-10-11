"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { apiRequest } from "@/libs/http";

type Message = { tone: "success" | "warning" | "danger"; text: string };

const noopSubscribe = () => () => {};

function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** Convierte la clave VAPID (base64url) al formato que pide pushManager.subscribe. */
function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export function PushNotifications({ publicKey }: { publicKey: string | null }) {
  const supported = useSyncExternalStore(noopSubscribe, isPushSupported, () => false);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!supported || !publicKey) return;
    let cancelled = false;
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (!cancelled) setSubscribed(Boolean(subscription));
      })
      .catch(() => {
        if (!cancelled) setSubscribed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supported, publicKey]);

  if (!publicKey) {
    return (
      <Alert tone="info">
        Las notificaciones push están desactivadas. Define <code>VAPID_PUBLIC_KEY</code> y{" "}
        <code>VAPID_PRIVATE_KEY</code> (genéralas con <code>npm run vapid</code>) y reinicia el servidor.
      </Alert>
    );
  }

  if (!supported) {
    return <Alert tone="warning">Este navegador no admite notificaciones push.</Alert>;
  }

  async function subscribe() {
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage({ tone: "warning", text: "No diste permiso para mostrar notificaciones en este navegador." });
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey!),
      });
      const result = await apiRequest("/api/push/subscription", { body: subscription.toJSON() });
      if (!result.ok) {
        await subscription.unsubscribe();
        setMessage({ tone: "danger", text: result.error });
        return;
      }
      setSubscribed(true);
      setMessage({ tone: "success", text: "Notificaciones activadas en este navegador." });
    } catch {
      setMessage({ tone: "danger", text: "No se pudieron activar las notificaciones." });
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await apiRequest("/api/push/subscription", { method: "DELETE", body: { endpoint: subscription.endpoint } });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      setMessage({ tone: "success", text: "Notificaciones desactivadas en este navegador." });
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setMessage(null);
    const result = await apiRequest<{ data: { sent: number } }>("/api/push/test");
    setBusy(false);
    setMessage(
      result.ok
        ? { tone: "success", text: `Notificación enviada a ${result.data.data.sent} dispositivo(s).` }
        : { tone: "danger", text: result.error },
    );
  }

  return (
    <div className="grid gap-4">
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <div className="flex flex-wrap gap-2">
        {subscribed ? (
          <>
            <Button variant="outline" onClick={unsubscribe} loading={busy}>
              {!busy && <BellOff className="size-4" aria-hidden />}
              Desactivar
            </Button>
            <Button onClick={sendTest} disabled={busy}>
              <Send className="size-4" aria-hidden />
              Enviar prueba
            </Button>
          </>
        ) : (
          <Button onClick={subscribe} loading={busy || subscribed === null}>
            {!busy && subscribed !== null && <Bell className="size-4" aria-hidden />}
            Activar notificaciones
          </Button>
        )}
      </div>
    </div>
  );
}
