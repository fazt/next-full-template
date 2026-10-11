"use client";

import { useEffect } from "react";

/** Registra /sw.js (PWA + notificaciones push). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => console.error("[pwa] No se pudo registrar el service worker", error));
  }, []);

  return null;
}
