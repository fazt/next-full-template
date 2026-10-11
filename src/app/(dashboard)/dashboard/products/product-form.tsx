"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormActions } from "@/components/form-actions";
import { ImageUpload } from "@/components/image-upload";
import { Field, fieldAria } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { apiRequest, applyFieldErrors } from "@/libs/http";
import { productSchema, type ProductInput } from "@/libs/validations/catalog";

export type ProductFormValues = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: string | null;
  imageUrl: string | null;
};

type ProductFormProps = {
  product?: ProductFormValues;
  categories: { id: string; name: string }[];
};

/** Formulario reutilizable para crear y editar productos. */
export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price,
      stock: product?.stock ?? 0,
      categoryId: product?.categoryId ?? "",
      imageUrl: product?.imageUrl ?? "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    const result = await apiRequest(product ? `/api/products/${product.id}` : "/api/products", {
      method: product ? "PATCH" : "POST",
      body: data,
    });
    if (!result.ok) {
      if (!applyFieldErrors(setFieldError, result.fieldErrors)) setError(result.error);
      return;
    }
    router.push("/dashboard/products");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      {error && <Alert tone="danger">{error}</Alert>}

      <Field label="Nombre" htmlFor="name" error={errors.name?.message}>
        <Input {...fieldAria("name", errors.name?.message)} {...register("name")} />
      </Field>

      <Field label="Descripción" htmlFor="description" error={errors.description?.message} hint="Opcional.">
        <Textarea rows={4} {...fieldAria("description", errors.description?.message)} {...register("description")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Precio" htmlFor="price" error={errors.price?.message}>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            {...fieldAria("price", errors.price?.message)}
            {...register("price", { valueAsNumber: true })}
          />
        </Field>

        <Field label="Stock" htmlFor="stock" error={errors.stock?.message}>
          <Input
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            {...fieldAria("stock", errors.stock?.message)}
            {...register("stock", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <Field label="Categoría" htmlFor="categoryId" error={errors.categoryId?.message}>
        <Select {...fieldAria("categoryId", errors.categoryId?.message)} {...register("categoryId")}>
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-1.5">
        <Label>Imagen</Label>
        <Controller
          control={control}
          name="imageUrl"
          render={({ field }) => (
            <ImageUpload
              value={field.value}
              onChange={(url) => field.onChange(url)}
              folder="products"
              error={errors.imageUrl?.message}
            />
          )}
        />
      </div>

      <FormActions
        cancelHref="/dashboard/products"
        submitLabel={product ? "Guardar cambios" : "Crear producto"}
        loading={isSubmitting}
      />
    </form>
  );
}
