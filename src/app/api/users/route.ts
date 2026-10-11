import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/libs/prisma";
import { apiError, isUniqueConstraintError, parseJson, requireApiUser } from "@/libs/api";
import { listUsers, publicUserSelect, userTable } from "@/libs/data/catalog";
import { hashPassword } from "@/libs/password";
import { parseTableState } from "@/libs/table";
import { userCreateSchema } from "@/libs/validations/user";

const EMAIL_TAKEN = "Ya existe un usuario con ese correo";

// GET /api/users?q=&role=&sort=&order=&page=&pageSize= (admin)
export async function GET(request: NextRequest) {
  const auth = await requireApiUser("ADMIN");
  if ("response" in auth) return auth.response;

  const state = parseTableState(Object.fromEntries(request.nextUrl.searchParams), userTable);
  const { rows, total, page, totalPages } = await listUsers(state);
  return NextResponse.json({ data: rows, total, page, pageSize: state.pageSize, totalPages });
}

// POST /api/users (admin)
export async function POST(request: Request) {
  const auth = await requireApiUser("ADMIN");
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, userCreateSchema);
  if ("response" in parsed) return parsed.response;
  const { name, email, role, password } = parsed.data;

  try {
    const user = await prisma.user.create({
      data: { name, email, role, password: await hashPassword(password) },
      select: publicUserSelect,
    });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) return apiError(409, EMAIL_TAKEN, { email: [EMAIL_TAKEN] });
    throw error;
  }
}
