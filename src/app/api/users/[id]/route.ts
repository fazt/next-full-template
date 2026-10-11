import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import {
  apiError,
  isNotFoundError,
  isUniqueConstraintError,
  parseJson,
  requireApiUser,
} from "@/libs/api";
import { publicUserSelect } from "@/libs/data/catalog";
import { hashPassword } from "@/libs/password";
import { userUpdateSchema } from "@/libs/validations/user";

type Context = { params: Promise<{ id: string }> };

const NOT_FOUND = "Usuario no encontrado";
const EMAIL_TAKEN = "Ya existe un usuario con ese correo";

export async function GET(_request: Request, { params }: Context) {
  const auth = await requireApiUser("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  if (!user) return apiError(404, NOT_FOUND);
  return NextResponse.json({ data: user });
}

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireApiUser("ADMIN");
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, userUpdateSchema.partial());
  if ("response" in parsed) return parsed.response;
  const { name, email, role, password } = parsed.data;
  const { id } = await params;

  // Evita que el admin se quede sin acceso por error
  if (id === auth.user.id && role && role !== "ADMIN") {
    return apiError(400, "No puedes quitarte el rol de administrador", {
      role: ["No puedes quitarte el rol de administrador"],
    });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(password && { password: await hashPassword(password) }),
      },
      select: publicUserSelect,
    });
    return NextResponse.json({ data: user });
  } catch (error) {
    if (isNotFoundError(error)) return apiError(404, NOT_FOUND);
    if (isUniqueConstraintError(error)) return apiError(409, EMAIL_TAKEN, { email: [EMAIL_TAKEN] });
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireApiUser("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  if (id === auth.user.id) return apiError(400, "No puedes eliminar tu propia cuenta");

  try {
    await prisma.user.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (isNotFoundError(error)) return apiError(404, NOT_FOUND);
    throw error;
  }
}
