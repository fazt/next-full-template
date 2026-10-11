import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { DeleteButton, EditLink } from "@/components/data-table/row-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button";
import { categoryTable, listCategories } from "@/libs/data/catalog";
import { requireUser } from "@/libs/session";
import { parseTableState, type SearchParams } from "@/libs/table";
import { formatDate } from "@/libs/utils";

export const metadata: Metadata = { title: "Categorías" };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const state = parseTableState(await searchParams, categoryTable);
  const { rows, total, page } = await listCategories(state);

  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Nombre",
      sortable: true,
      cell: (category) => <span className="font-medium">{category.name}</span>,
    },
    {
      key: "description",
      header: "Descripción",
      className: "max-w-sm",
      cell: (category) => (
        <span className="line-clamp-1 text-muted-foreground">{category.description || "—"}</span>
      ),
    },
    {
      key: "products",
      header: "Productos",
      sortable: true,
      cell: (category) => (
        <Link href={`/dashboard/products?category=${category.id}`} className="text-primary hover:underline">
          {category._count.products}
        </Link>
      ),
    },
    {
      key: "createdAt",
      header: "Creada",
      sortable: true,
      className: "whitespace-nowrap",
      cell: (category) => formatDate(category.createdAt),
    },
  ];

  if (isAdmin) {
    columns.push({
      key: "actions",
      header: "Acciones",
      className: "w-24 text-right",
      cell: (category) => (
        <div className="flex justify-end gap-1">
          <EditLink href={`/dashboard/categories/${category.id}/edit`} />
          <DeleteButton
            endpoint={`/api/categories/${category.id}`}
            confirmMessage={`¿Eliminar la categoría "${category.name}"? Sus productos quedarán sin categoría.`}
          />
        </div>
      ),
    });
  }

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Agrupa los productos del catálogo."
        actions={
          isAdmin && (
            <Link href="/dashboard/categories/new" className={buttonVariants()}>
              <Plus className="size-4" aria-hidden />
              Nueva categoría
            </Link>
          )
        }
      />
      <DataTable
        basePath="/dashboard/categories"
        columns={columns}
        rows={rows}
        total={total}
        state={{ ...state, page }}
        searchPlaceholder="Buscar categorías…"
        getRowKey={(category) => category.id}
      />
    </>
  );
}
