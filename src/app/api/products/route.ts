import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/libs/prisma";
import { apiError, parseJson, requireApiUser } from "@/libs/api";
import { listProducts, productTable } from "@/libs/data/catalog";
import { parseTableState } from "@/libs/table";
import { productSchema } from "@/libs/validations/catalog";

const CATEGORY_NOT_FOUND = "La categoría seleccionada no existe";

// GET /api/products?q=&category=&sort=&order=&page=&pageSize=
export async function GET(request: NextRequest) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const state = parseTableState(Object.fromEntries(request.nextUrl.searchParams), productTable);
  const { rows, total, page, totalPages } = await listProducts(state);
  return NextResponse.json({ data: rows, total, page, pageSize: state.pageSize, totalPages });
}

// POST /api/products (admin)
export async function POST(request: Request) {
  const auth = await requireApiUser("ADMIN");
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, productSchema);
  if ("response" in parsed) return parsed.response;
  const { name, description, price, stock, categoryId, imageUrl } = parsed.data;

  if (categoryId && !(await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }))) {
    return apiError(400, CATEGORY_NOT_FOUND, { categoryId: [CATEGORY_NOT_FOUND] });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: description || null,
      price,
      stock,
      categoryId: categoryId || null,
      imageUrl: imageUrl || null,
    },
  });
  return NextResponse.json({ data: product }, { status: 201 });
}
