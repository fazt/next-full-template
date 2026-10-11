"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { apiRequest, applyFieldErrors } from "@/libs/http";
import { resetPasswordFormSchema, type ResetPasswordFormInput } from "@/libs/validations/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    setError(null);
    const result = await apiRequest("/api/auth/reset-password", { body: { token, password } });
    if (!result.ok) {
      // El error del token no corresponde a un campo visible
      if (result.fieldErrors?.token || !applyFieldErrors(setFieldError, result.fieldErrors)) {
        setError(result.error);
      }
      return;
    }
    router.replace("/auth/signin?reset=1");
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {error && <Alert tone="danger">{error}</Alert>}
      <input type="hidden" {...register("token")} />

      <Field label="Nueva contraseña" htmlFor="password" error={errors.password?.message}>
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
        Guardar contraseña
      </Button>
    </form>
  );
}
