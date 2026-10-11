"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { Input, Label } from "@/components/ui/input";
import { apiRequest, applyFieldErrors } from "@/libs/http";
import { profileSchema, type ProfileInput } from "@/libs/validations/user";

export function ProfileForm({ user }: { user: ProfileInput }) {
  const router = useRouter();
  const [status, setStatus] = useState<{ tone: "success" | "danger"; message: string } | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: user,
  });

  const onSubmit = handleSubmit(async (data) => {
    setStatus(null);
    const result = await apiRequest("/api/profile", { method: "PATCH", body: data });
    if (!result.ok) {
      if (!applyFieldErrors(setError, result.fieldErrors)) setStatus({ tone: "danger", message: result.error });
      return;
    }
    reset(data);
    setStatus({ tone: "success", message: "Perfil actualizado" });
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      {status && <Alert tone={status.tone}>{status.message}</Alert>}

      <div className="grid gap-1.5">
        <Label>Avatar</Label>
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <ImageUpload
              value={field.value}
              onChange={(url) => field.onChange(url)}
              folder="avatars"
              shape="circle"
              error={errors.image?.message}
            />
          )}
        />
      </div>

      <Field label="Nombre" htmlFor="name" error={errors.name?.message}>
        <Input autoComplete="name" {...fieldAria("name", errors.name?.message)} {...register("name")} />
      </Field>

      <Field label="Correo" htmlFor="email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...fieldAria("email", errors.email?.message)} {...register("email")} />
      </Field>

      <div className="flex justify-end border-t border-border pt-5">
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
