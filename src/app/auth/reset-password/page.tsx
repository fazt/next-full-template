import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { findValidResetToken } from "@/libs/tokens";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Nueva contraseña" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;
  const valid = typeof token === "string" && token.length >= 32 && (await findValidResetToken(token));

  if (!valid) {
    return (
      <AuthCard title="Enlace no válido">
        <Alert tone="danger">El enlace no es válido o ya caducó. Solicita uno nuevo.</Alert>
        <Link href="/auth/forgot-password" className={buttonVariants({ className: "w-full" })}>
          Solicitar un nuevo enlace
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Crea una nueva contraseña" description="Usa al menos 8 caracteres">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
