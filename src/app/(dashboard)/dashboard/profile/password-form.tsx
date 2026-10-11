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
import { changePasswordFormSchema, type ChangePasswordFormInput } from "@/libs/validations/user";

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormInput>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setStatus(null);
    if (hasPassword && !currentPassword) {
      setError("currentPassword", { message: "Ingresa tu contraseña actual" });
      return;
    }
    const result = await apiRequest("/api/profile/password", {
      method: "PATCH",
      body: { currentPassword, newPassword },
    });
    if (!result.ok) {
      if (!applyFieldErrors(setError, result.fieldErrors)) setStatus({ tone: "danger", message: result.error });
      return;
    }
    reset();
    setStatus({ tone: "success", message: "Contraseña actualizada" });
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      {status && <Alert tone={status.tone}>{status.message}</Alert>}

      {hasPassword && (
        <Field label="Contraseña actual" htmlFor="currentPassword" error={errors.currentPassword?.message}>
          <Input
            type="password"
            autoComplete="current-password"
            {...fieldAria("currentPassword", errors.currentPassword?.message)}
            {...register("currentPassword")}
          />
        </Field>
      )}

      <Field label="Nueva contraseña" htmlFor="newPassword" error={errors.newPassword?.message}>
        <Input
          type="password"
          autoComplete="new-password"
          {...fieldAria("newPassword", errors.newPassword?.message)}
          {...register("newPassword")}
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

      <div className="flex justify-end border-t border-border pt-5">
        <Button type="submit" loading={isSubmitting}>
          {hasPassword ? "Cambiar contraseña" : "Crear contraseña"}
        </Button>
      </div>
    </form>
  );
}
