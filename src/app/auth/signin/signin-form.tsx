"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { signInSchema, type SignInInput } from "@/libs/validations/auth";

const signInErrors: Record<string, string> = {
  CredentialsSignin: "Correo o contraseña incorrectos.",
  TooManyAttempts: "Demasiados intentos. Espera unos minutos y vuelve a probar.",
};

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    const result = await signIn("credentials", { ...data, redirect: false });
    if (!result || result.error) {
      setError(signInErrors[result?.error ?? ""] ?? "No se pudo iniciar sesión. Inténtalo de nuevo.");
      return;
    }
    router.replace(callbackUrl);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {error && <Alert tone="danger">{error}</Alert>}

      <Field label="Correo" htmlFor="email" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          {...fieldAria("email", errors.email?.message)}
          {...register("email")}
        />
      </Field>

      <Field label="Contraseña" htmlFor="password" error={errors.password?.message}>
        <Input
          type="password"
          autoComplete="current-password"
          {...fieldAria("password", errors.password?.message)}
          {...register("password")}
        />
      </Field>

      <div className="-mt-1 text-right">
        <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Iniciar sesión
      </Button>
    </form>
  );
}
