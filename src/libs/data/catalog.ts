import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/libs/prisma";
import { paginate, type TableConfig, type TableState } from "@/libs/table";

// ─── Categorías ──────────────────────────────────────────────────────────

export const categoryTable = {
  sortable: ["name", "products", "createdAt"],
  defaultSort: "name",
  defaultOrder: "asc",
} satisfies TableConfig;

export async function listCategories(state: TableState) {
  const where: Prisma.CategoryWhereInput = state.q
    ? {
        OR: [
          { name: { contains: state.q, mode: "insensitive" } },
          { description: { contains: state.q, mode: "insensitive" } },
        ],
      }
    : {};

  const orderBy: Prisma.CategoryOrderByWithRelationInput =
    state.sort === "products" ? { products: { _count: state.order } } : { [state.sort]: state.order };

  const total = await prisma.category.count({ where });
  const { page, skip, take, totalPages } = paginate(state, total);
  const rows = await prisma.category.findMany({
    where,
    orderBy,
    skip,
    take,
    include: { _count: { select: { products: true } } },
  });

  return { rows, total, page, totalPages };
}

export function getCategoryOptions() {
  return prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

// ─── Productos ───────────────────────────────────────────────────────────

export const productTable = {
  sortable: ["name", "category", "price", "stock", "createdAt"],
  defaultSort: "createdAt",
  defaultOrder: "desc",
  filters: ["category"],
} satisfies TableConfig;

/** Valor del filtro de categoría para productos sin categoría. */
export const NO_CATEGORY = "none";

export async function listProducts(state: TableState) {
  const category = state.filters.category;
  const where: Prisma.ProductWhereInput = {
    ...(state.q && {
      OR: [
        { name: { contains: state.q, mode: "insensitive" } },
        { description: { contains: state.q, mode: "insensitive" } },
      ],
    }),
    ...(category && { categoryId: category === NO_CATEGORY ? null : category }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    state.sort === "category" ? { category: { name: state.order } } : { [state.sort]: state.order };

  const total = await prisma.product.count({ where });
  const { page, skip, take, totalPages } = paginate(state, total);
  const rows = await prisma.product.findMany({
    where,
    orderBy: [orderBy, { id: "asc" }],
    skip,
    take,
    include: { category: { select: { id: true, name: true } } },
  });

  return { rows, total, page, totalPages };
}

// ─── Usuarios ────────────────────────────────────────────────────────────

export const userTable = {
  sortable: ["name", "email", "role", "createdAt"],
  defaultSort: "createdAt",
  defaultOrder: "desc",
  filters: ["role"],
} satisfies TableConfig;

/** Campos públicos de un usuario: nunca se expone el hash de la contraseña. */
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export async function listUsers(state: TableState) {
  const role = state.filters.role;
  const where: Prisma.UserWhereInput = {
    ...(state.q && {
      OR: [
        { name: { contains: state.q, mode: "insensitive" } },
        { email: { contains: state.q, mode: "insensitive" } },
      ],
    }),
    ...((role === "ADMIN" || role === "USER") && { role }),
  };

  const total = await prisma.user.count({ where });
  const { page, skip, take, totalPages } = paginate(state, total);
  const rows = await prisma.user.findMany({
    where,
    orderBy: [{ [state.sort]: state.order }, { id: "asc" }],
    skip,
    take,
    select: publicUserSelect,
  });

  return { rows, total, page, totalPages };
}
