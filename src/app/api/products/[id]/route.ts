import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { apiError, isNotFoundError, parseJson, requireApiUser } from "@/libs/api";
import { productSchema } from "@/libs/validations/catalog";

type Context = { params: Promise<{ id: string }> };

const NOT_FOUND = "Producto no encontrado";
const CATEGORY_NOT_FOUND = "La categoría seleccionada no existe";

export async function GET(_request: Request, { params }: Context) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true } } },
  });
  if (!product) return apiError(404, NOT_FOUND);
  return NextResponse.json({ data: product });
}

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireApiUser("ADMIN");
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, productSchema.partial());
  if ("response" in parsed) return parsed.response;
  const { name, description, price, stock, categoryId, imageUrl } = parsed.data;
  const { id } = await params;

  if (categoryId && !(await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }))) {
    return apiError(400, CATEGORY_NOT_FOUND, { categoryId: [CATEGORY_NOT_FOUND] });
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
      },
    });
    return NextResponse.json({ data: product });
  } catch (error) {
    if (isNotFoundError(error)) return apiError(404, NOT_FOUND);
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireApiUser("ADMIN");
  if ("response" in auth) return auth.response;

  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (isNotFoundError(error)) return apiError(404, NOT_FOUND);
    throw error;
  }
}
