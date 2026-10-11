import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleButton } from "@/components/auth/google-button";
import { Alert } from "@/components/ui/feedback";
import { safeCallbackUrl } from "@/config/routes";
import { isGoogleEnabled } from "@/libs/auth";
import { SignInForm } from "./signin-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

// Errores que NextAuth envía como ?error=...
const authErrors: Record<string, string> = {
  OAuthAccountNotLinked: "Ese correo ya está vinculado a otro método de inicio de sesión.",
  AccessDenied: "No se pudo iniciar sesión con esa cuenta.",
  OAuthSignin: "No se pudo conectar con el proveedor. Inténtalo de nuevo.",
  OAuthCallback: "No se pudo conectar con el proveedor. Inténtalo de nuevo.",
  CredentialsSignin: "Correo o contraseña incorrectos.",
  SessionRequired: "Inicia sesión para continuar.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const value = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);

  const callbackUrl = safeCallbackUrl(value("callbackUrl"));
  const error = value("error");
  const googleEnabled = isGoogleEnabled();

  return (
    <AuthCard
      title="Bienvenido de vuelta"
      description="Ingresa con tu correo y contraseña"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="font-medium text-primary hover:underline">
            Regístrate
          </Link>
        </>
      }
    >
      {value("registered") && <Alert tone="success">Cuenta creada. Ya puedes iniciar sesión.</Alert>}
      {value("reset") && <Alert tone="success">Contraseña actualizada. Inicia sesión con la nueva.</Alert>}
      {error && <Alert tone="danger">{authErrors[error] ?? "No se pudo iniciar sesión."}</Alert>}

      <SignInForm callbackUrl={callbackUrl} />

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
          </div>
          <GoogleButton callbackUrl={callbackUrl} />
        </>
      )}
    </AuthCard>
  );
}
