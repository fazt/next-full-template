import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/libs/session";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="grid max-w-2xl gap-6">
      <PageHeader title="Perfil" description="Tu información personal y tu contraseña." />

      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>Así te verán los demás en la aplicación.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={{ name: user.name ?? "", email: user.email, image: user.image ?? "" }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{user.hasPassword ? "Cambiar contraseña" : "Crear contraseña"}</CardTitle>
          <CardDescription>
            {user.hasPassword
              ? "Usa al menos 8 caracteres."
              : "Tu cuenta se creó con Google. Define una contraseña para entrar también con tu correo."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm hasPassword={user.hasPassword} />
        </CardContent>
      </Card>
    </div>
  );
}
