import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { apiError, isUniqueConstraintError, parseJson, requireApiUser } from "@/libs/api";
import { publicUserSelect } from "@/libs/data/catalog";
import { profileSchema } from "@/libs/validations/user";

const EMAIL_TAKEN = "Ese correo ya está en uso";

// GET /api/profile: datos del usuario autenticado
export async function GET() {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const user = await prisma.user.findUnique({ where: { id: auth.user.id }, select: publicUserSelect });
  return NextResponse.json({ data: { ...user, hasPassword: auth.user.hasPassword } });
}

// PATCH /api/profile: nombre, correo y avatar
export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, profileSchema.partial());
  if ("response" in parsed) return parsed.response;
  const { name, email, image } = parsed.data;

  try {
    const user = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(image !== undefined && { image: image || null }),
      },
      select: publicUserSelect,
    });
    return NextResponse.json({ data: user });
  } catch (error) {
    if (isUniqueConstraintError(error)) return apiError(409, EMAIL_TAKEN, { email: [EMAIL_TAKEN] });
    throw error;
  }
}
