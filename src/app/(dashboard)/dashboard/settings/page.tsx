import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { ThemeSelector } from "@/components/theme-selector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/libs/session";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  await requireUser();

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
    </div>
  );
}
