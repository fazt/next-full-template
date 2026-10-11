import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/libs/prisma";
import { apiError, isUniqueConstraintError, parseJson, requireApiUser } from "@/libs/api";
import { categoryTable, listCategories } from "@/libs/data/catalog";
import { parseTableState } from "@/libs/table";
import { categorySchema } from "@/libs/validations/catalog";

const NAME_TAKEN = "Ya existe una categoría con ese nombre";

// GET /api/categories?q=&sort=&order=&page=&pageSize=
export async function GET(request: NextRequest) {
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const state = parseTableState(Object.fromEntries(request.nextUrl.searchParams), categoryTable);
  const { rows, total, page, totalPages } = await listCategories(state);
  return NextResponse.json({ data: rows, total, page, pageSize: state.pageSize, totalPages });
}

// POST /api/categories (admin)
export async function POST(request: Request) {
  const auth = await requireApiUser("ADMIN");
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, categorySchema);
  if ("response" in parsed) return parsed.response;
  const { name, description } = parsed.data;

  try {
    const category = await prisma.category.create({
      data: { name, description: description || null },
    });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) return apiError(409, NAME_TAKEN, { name: [NAME_TAKEN] });
    throw error;
  }
}
