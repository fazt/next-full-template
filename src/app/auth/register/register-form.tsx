"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { DEFAULT_LOGIN_REDIRECT } from "@/config/routes";
import { apiRequest, applyFieldErrors } from "@/libs/http";
import { registerFormSchema, type RegisterFormInput } from "@/libs/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setError(null);
    const result = await apiRequest("/api/auth/register", { body: { name, email, password } });
    if (!result.ok) {
      if (!applyFieldErrors(setFieldError, result.fieldErrors)) setError(result.error);
      return;
    }

    // Inicia sesión automáticamente con la cuenta recién creada
    const login = await signIn("credentials", { email, password, redirect: false });
    if (login?.error) {
      router.push("/auth/signin?registered=1");
      return;
    }
    router.replace(DEFAULT_LOGIN_REDIRECT);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {error && <Alert tone="danger">{error}</Alert>}

      <Field label="Nombre" htmlFor="name" error={errors.name?.message}>
        <Input autoComplete="name" {...fieldAria("name", errors.name?.message)} {...register("name")} />
      </Field>

      <Field label="Correo" htmlFor="email" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          {...fieldAria("email", errors.email?.message)}
          {...register("email")}
        />
      </Field>

      <Field label="Contraseña" htmlFor="password" error={errors.password?.message} hint="Mínimo 8 caracteres.">
        <Input
          type="password"
          autoComplete="new-password"
          {...fieldAria("password", errors.password?.message)}
          {...register("password")}
        />
      </Field>

      <Field label="Confirmar contraseña" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
        <Input
          type="password"
          autoComplete="new-password"
          {...fieldAria("confirmPassword", errors.confirmPassword?.message)}
          {...register("confirmPassword")}
        />
      </Field>

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Crear cuenta
      </Button>
    </form>
  );
}
