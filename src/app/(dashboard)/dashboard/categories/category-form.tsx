"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormActions } from "@/components/form-actions";
import { Field, fieldAria } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { Input, Textarea } from "@/components/ui/input";
import { apiRequest, applyFieldErrors } from "@/libs/http";
import { categorySchema, type CategoryInput } from "@/libs/validations/catalog";

type CategoryFormProps = {
  category?: { id: string; name: string; description: string | null };
};

/** Formulario reutilizable para crear y editar categorías. */
export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? "", description: category?.description ?? "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    const result = await apiRequest(category ? `/api/categories/${category.id}` : "/api/categories", {
      method: category ? "PATCH" : "POST",
      body: data,
    });
    if (!result.ok) {
      if (!applyFieldErrors(setFieldError, result.fieldErrors)) setError(result.error);
      return;
    }
    router.push("/dashboard/categories");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      {error && <Alert tone="danger">{error}</Alert>}

      <Field label="Nombre" htmlFor="name" error={errors.name?.message}>
        <Input {...fieldAria("name", errors.name?.message)} {...register("name")} />
      </Field>

      <Field label="Descripción" htmlFor="description" error={errors.description?.message} hint="Opcional.">
        <Textarea rows={3} {...fieldAria("description", errors.description?.message)} {...register("description")} />
      </Field>

      <FormActions
        cancelHref="/dashboard/categories"
        submitLabel={category ? "Guardar cambios" : "Crear categoría"}
        loading={isSubmitting}
      />
    </form>
  );
}
