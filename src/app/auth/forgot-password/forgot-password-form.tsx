"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/libs/http";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/libs/validations/auth";

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setStatus(null);
    const result = await apiRequest<{ message: string }>("/api/auth/forgot-password", { body: data });
    setStatus(
      result.ok
        ? { tone: "success", message: result.data.message }
        : { tone: "danger", message: result.error },
    );
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {status && <Alert tone={status.tone}>{status.message}</Alert>}

      <Field label="Correo" htmlFor="email" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          {...fieldAria("email", errors.email?.message)}
          {...register("email")}
        />
      </Field>

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Enviar enlace
      </Button>
    </form>
  );
}
