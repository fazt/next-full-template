import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { DEFAULT_LOGIN_REDIRECT } from "@/config/routes";
import { isGoogleEnabled } from "@/libs/auth";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  // Render en cada petición: el botón de Google depende de variables de entorno en runtime
  await connection();

  return (
    <AuthCard
      title="Crea tu cuenta"
      description="Empieza en menos de un minuto"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <RegisterForm />
      {isGoogleEnabled() && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
          </div>
          <GoogleButton callbackUrl={DEFAULT_LOGIN_REDIRECT} />
        </>
      )}
    </AuthCard>
  );
}
