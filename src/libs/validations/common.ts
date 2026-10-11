import { z } from "zod";

// Mensajes por defecto en español para cualquier regla sin mensaje propio.
z.config(z.locales.es());

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Ingresa un correo válido" }));

// bcrypt solo usa los primeros 72 bytes
export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña no puede superar los 72 caracteres");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(80, "El nombre no puede superar los 80 caracteres");

// URL absoluta (S3/Spaces) o ruta local servida por /uploads/...
export const imageUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => value === "" || value.startsWith("/uploads/") || /^https?:\/\//.test(value),
    "La imagen debe ser una URL válida",
  );

export { z };
