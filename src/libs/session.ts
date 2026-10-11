import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/libs/auth";
import prisma from "@/libs/prisma";

/**
 * Usuario de la sesión leído desde la base de datos (rol siempre actualizado).
 * El proxy solo hace una comprobación optimista con el JWT; las decisiones
 * de autorización reales se toman aquí.
 */
export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, role: true, password: true },
  });
  if (!user) return null;

  const { password, ...rest } = user;
  return { ...rest, hasPassword: Boolean(password) };
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard?denied=1");
  return user;
}
