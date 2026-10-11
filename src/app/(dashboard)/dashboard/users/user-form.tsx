"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormActions } from "@/components/form-actions";
import { Field, fieldAria } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/input";
import { apiRequest, applyFieldErrors } from "@/libs/http";
import { userCreateSchema, userUpdateSchema, type UserUpdateInput } from "@/libs/validations/user";

type UserFormProps = {
  user?: { id: string; name: string | null; email: string; role: "ADMIN" | "USER" };
  isSelf?: boolean;
};

/** Formulario reutilizable para crear y editar usuarios. */
export function UserForm({ user, isSelf = false }: UserFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<UserUpdateInput>({
    // Al crear, la contraseña es obligatoria; al editar, vacía = sin cambios
    resolver: zodResolver(user ? userUpdateSchema : userCreateSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "USER",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    const result = await apiRequest(user ? `/api/users/${user.id}` : "/api/users", {
      method: user ? "PATCH" : "POST",
      body: data,
    });
    if (!result.ok) {
      if (!applyFieldErrors(setFieldError, result.fieldErrors)) setError(result.error);
      return;
    }
    router.push("/dashboard/users");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      {error && <Alert tone="danger">{error}</Alert>}

      <Field label="Nombre" htmlFor="name" error={errors.name?.message}>
        <Input autoComplete="off" {...fieldAria("name", errors.name?.message)} {...register("name")} />
      </Field>

      <Field label="Correo" htmlFor="email" error={errors.email?.message}>
        <Input type="email" autoComplete="off" {...fieldAria("email", errors.email?.message)} {...register("email")} />
      </Field>

      <Field
        label="Rol"
        htmlFor="role"
        error={errors.role?.message}
        hint={isSelf ? "No puedes cambiar tu propio rol." : undefined}
      >
        <Select disabled={isSelf} {...fieldAria("role", errors.role?.message)} {...register("role")}>
          <option value="USER">Usuario</option>
          <option value="ADMIN">Administrador</option>
        </Select>
      </Field>

      <Field
        label={user ? "Nueva contraseña" : "Contraseña"}
        htmlFor="password"
        error={errors.password?.message}
        hint={user ? "Déjala vacía para no cambiarla." : "Mínimo 8 caracteres."}
      >
        <Input
          type="password"
          autoComplete="new-password"
          {...fieldAria("password", errors.password?.message)}
          {...register("password")}
        />
      </Field>

      <FormActions
        cancelHref="/dashboard/users"
        submitLabel={user ? "Guardar cambios" : "Crear usuario"}
        loading={isSubmitting}
      />
    </form>
  );
}
