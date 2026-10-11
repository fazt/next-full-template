import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { ThemeSelector } from "@/components/theme-selector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getVapidPublicKey } from "@/libs/push";
import { requireUser } from "@/libs/session";
import { BroadcastForm } from "./broadcast-form";
import { PushNotifications } from "./push-notifications";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const user = await requireUser();
  // La clave pública se lee en runtime: no hace falta reconstruir para activar push
  const publicKey = getVapidPublicKey();

  return (
    <div className="grid max-w-2xl gap-6">
      <PageHeader title="Ajustes" description="Preferencias de la aplicación en este dispositivo." />

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Elige el tema de la interfaz. Se guarda en este navegador.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones push</CardTitle>
          <CardDescription>Recibe avisos en este navegador aunque la pestaña esté cerrada.</CardDescription>
        </CardHeader>
        <CardContent>
          <PushNotifications publicKey={publicKey} />
        </CardContent>
      </Card>

      {user.role === "ADMIN" && publicKey && (
        <Card>
          <CardHeader>
            <CardTitle>Enviar notificación</CardTitle>
            <CardDescription>Se envía a todos los usuarios que activaron las notificaciones.</CardDescription>
          </CardHeader>
          <CardContent>
            <BroadcastForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
