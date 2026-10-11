import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = { title: "Sin conexión" };

// Página estática que el service worker guarda en caché para mostrarla sin red.
export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="max-w-sm text-center">
        <LogoMark className="mx-auto mb-6 size-12 text-lg" />
        <WifiOff className="mx-auto size-8 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Sin conexión</h1>
        <p className="mt-2 text-muted-foreground">
          No pudimos cargar la página. Revisa tu conexión a internet y vuelve a intentarlo.
        </p>
        <RetryButton />
      </div>
    </main>
  );
}
