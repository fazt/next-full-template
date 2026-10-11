import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Plus } from "lucide-react";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { DeleteButton, EditLink } from "@/components/data-table/row-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/feedback";
import { getCategoryOptions, listProducts, NO_CATEGORY, productTable } from "@/libs/data/catalog";
import { requireUser } from "@/libs/session";
import { parseTableState, type SearchParams } from "@/libs/table";
import { formatDate, formatPrice } from "@/libs/utils";

export const metadata: Metadata = { title: "Productos" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const state = parseTableState(await searchParams, productTable);
  const [{ rows, total, page }, categories] = await Promise.all([listProducts(state), getCategoryOptions()]);

  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Producto",
      sortable: true,
      cell: (product) => (
        <div className="flex items-center gap-3">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              width={36}
              height={36}
              unoptimized
              className="size-9 shrink-0 rounded-md border border-border object-cover"
            />
          ) : (
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
              <ImageIcon className="size-4" aria-hidden />
            </span>
          )}
          <span className="font-medium">{product.name}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      sortable: true,
      cell: (product) =>
        product.category ? (
          <Badge tone="primary">{product.category.name}</Badge>
        ) : (
          <span className="text-muted-foreground">Sin categoría</span>
        ),
    },
    {
      key: "price",
      header: "Precio",
      sortable: true,
      className: "text-right tabular-nums whitespace-nowrap",
      cell: (product) => formatPrice(product.price),
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      className: "text-right tabular-nums",
      cell: (product) =>
        product.stock < 5 ? <Badge tone="warning">{product.stock}</Badge> : product.stock,
    },
    {
      key: "createdAt",
      header: "Creado",
      sortable: true,
      className: "whitespace-nowrap",
      cell: (product) => formatDate(product.createdAt),
    },
  ];

  if (isAdmin) {
    columns.push({
      key: "actions",
      header: "Acciones",
      className: "w-24 text-right",
      cell: (product) => (
        <div className="flex justify-end gap-1">
          <EditLink href={`/dashboard/products/${product.id}/edit`} />
          <DeleteButton
            endpoint={`/api/products/${product.id}`}
            confirmMessage={`¿Eliminar el producto "${product.name}"?`}
          />
        </div>
      ),
    });
  }

  return (
    <>
      <PageHeader
        title="Productos"
        description="Catálogo de productos con su precio y stock."
        actions={
          isAdmin && (
            <Link href="/dashboard/products/new" className={buttonVariants()}>
              <Plus className="size-4" aria-hidden />
              Nuevo producto
            </Link>
          )
        }
      />
      <DataTable
        basePath="/dashboard/products"
        columns={columns}
        rows={rows}
        total={total}
        state={{ ...state, page }}
        searchPlaceholder="Buscar productos…"
        filters={[
          {
            key: "category",
            label: "Categoría",
            options: [
              ...categories.map((category) => ({ value: category.id, label: category.name })),
              { value: NO_CATEGORY, label: "Sin categoría" },
            ],
          },
        ]}
        getRowKey={(product) => product.id}
      />
    </>
  );
}
