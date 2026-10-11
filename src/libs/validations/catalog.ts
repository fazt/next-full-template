import { imageUrlSchema, z } from "./common";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "El nombre no puede superar los 60 caracteres"),
  description: z.string().trim().max(300, "Máximo 300 caracteres"),
});

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  description: z.string().trim().max(1000, "Máximo 1000 caracteres"),
  price: z
    .number({ error: "Ingresa un precio válido" })
    .min(0, "El precio no puede ser negativo")
    .max(99_999_999.99, "Precio demasiado alto")
    .refine((value) => Number.isInteger(Math.round(value * 100 * 1e6) / 1e6), "Usa como máximo 2 decimales"),
  stock: z
    .number({ error: "Ingresa un stock válido" })
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo")
    .max(1_000_000, "Stock demasiado alto"),
  // "" significa sin categoría
  categoryId: z.string().trim().max(50),
  imageUrl: imageUrlSchema,
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
