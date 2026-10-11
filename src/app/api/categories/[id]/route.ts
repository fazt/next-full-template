import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import {
  apiError,
  isNotFoundError,
  isUniqueConstraintError,
  parseJson,
  requireApiUser,
} from "@/libs/api";
import { categorySchema } from "@/libs/validations/catalog";

type Context = { params: Promise<{ id: string }> };

const NOT_FOUND = "Categoría no encontrada";
const NAME_TAKEN = "Ya existe una categoría con ese nombre";

export async function GET(_request: Request, { params }: Context) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) return apiError(404, NOT_FOUND);
  return NextResponse.json({ data: category });
}

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireApiUser("ADMIN");
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, categorySchema.partial());
  if ("response" in parsed) return parsed.response;
  const { name, description } = parsed.data;
  const { id } = await params;

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
      },
    });
    return NextResponse.json({ data: category });
  } catch (error) {
    if (isNotFoundError(error)) return apiError(404, NOT_FOUND);
    if (isUniqueConstraintError(error)) return apiError(409, NAME_TAKEN, { name: [NAME_TAKEN] });
    throw error;
  }
}

// Los productos de la categoría quedan sin categoría (onDelete: SetNull)
export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireApiUser("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (isNotFoundError(error)) return apiError(404, NOT_FOUND);
    throw error;
  }
}
