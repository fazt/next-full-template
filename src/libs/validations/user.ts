import { emailSchema, imageUrlSchema, nameSchema, passwordSchema, z } from "./common";

export const roleSchema = z.enum(["ADMIN", "USER"], { error: "Selecciona un rol válido" });

/** Alta de usuario por un admin: la contraseña es obligatoria. */
export const userCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: roleSchema,
  password: passwordSchema,
});

/** Edición: contraseña vacía = no cambiarla. */
export const userUpdateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: roleSchema,
  password: z.union([z.literal(""), passwordSchema]),
});

/** Datos del propio perfil. */
export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  image: imageUrlSchema,
});

export const changePasswordSchema = z.object({
  // Vacía solo si la cuenta aún no tiene contraseña (creada con Google)
  currentPassword: z.string().max(72),
  newPassword: passwordSchema,
});

export const changePasswordFormSchema = changePasswordSchema
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Las contraseñas no coinciden",
  });

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordFormInput = z.infer<typeof changePasswordFormSchema>;
