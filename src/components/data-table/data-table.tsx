import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { buildTableHref, type TableState } from "@/libs/table";
import { cn } from "@/libs/utils";
import { PageSizeSelect, TableFilter, TableSearch, type FilterDef } from "./table-controls";

export type Column<T> = {
  key: string;
  header: string;
  /** Si es true, el encabezado ordena por `key` (debe estar en `sortable` del servidor). */
  sortable?: boolean;
  className?: string;
  cell: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  basePath: string;
  columns: Column<T>[];
  rows: T[];
  total: number;
  state: TableState;
  filters?: FilterDef[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  getRowKey: (row: T) => string;
};

/**
 * Tabla dinámica reutilizable (componente de servidor).
 * Búsqueda, filtros, orden y paginación viven en la URL y se resuelven
 * en la consulta a la base de datos, así que escala a miles de filas.
 */
export function DataTable<T>({
  basePath,
  columns,
  rows,
  total,
  state,
  filters = [],
  searchPlaceholder,
  emptyMessage = "No hay registros que coincidan con la búsqueda.",
  getRowKey,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  const from = total === 0 ? 0 : (state.page - 1) * state.pageSize + 1;
  const to = Math.min(state.page * state.pageSize, total);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <TableSearch basePath={basePath} state={state} placeholder={searchPlaceholder} />
        {filters.map((filter) => (
          <TableFilter key={filter.key} basePath={basePath} state={state} filter={filter} />
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              {columns.map((column) => {
                const sorted = state.sort === column.key;
                const nextOrder = sorted && state.order === "asc" ? "desc" : "asc";
                const SortIcon = !sorted ? ArrowUpDown : state.order === "asc" ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn("px-4 py-3 font-medium", column.className)}
                    aria-sort={sorted ? (state.order === "asc" ? "ascending" : "descending") : undefined}
                  >
                    {column.sortable ? (
                      <Link
                        href={buildTableHref(basePath, state, { sort: column.key, order: nextOrder, page: 1 })}
                        scroll={false}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {column.header}
                        <SortIcon className={cn("size-3.5", !sorted && "opacity-40")} aria-hidden />
                      </Link>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-muted-foreground">
                  <Inbox className="mx-auto mb-2 size-6" aria-hidden />
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={getRowKey(row)} className="transition-colors hover:bg-muted/40">
                  {columns.map((column) => (
                    <td key={column.key} className={cn("px-4 py-3 align-middle", column.className)}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <p>
          {total === 0 ? "Sin resultados" : `Mostrando ${from}–${to} de ${total}`}
        </p>
        <div className="flex items-center gap-2">
          <PageSizeSelect basePath={basePath} state={state} />
          <span className="px-2 whitespace-nowrap">
            Página {state.page} de {totalPages}
          </span>
          <PageLink
            href={buildTableHref(basePath, state, { page: state.page - 1 })}
            disabled={state.page <= 1}
            label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </PageLink>
          <PageLink
            href={buildTableHref(basePath, state, { page: state.page + 1 })}
            disabled={state.page >= totalPages}
            label="Página siguiente"
          >
            <ChevronRight className="size-4" />
          </PageLink>
        </div>
      </div>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const className = buttonVariants({ variant: "outline", size: "icon", className: "size-8" });
  if (disabled) {
    return (
      <span className={cn(className, "pointer-events-none opacity-50")} aria-disabled="true" aria-label={label}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} scroll={false} className={className} aria-label={label}>
      {children}
    </Link>
  );
}
