// Estado de las tablas dinámicas en la URL (?q=&sort=&order=&page=&pageSize=&<filtro>=).
// Se usa tanto en el servidor (consultas) como en el cliente (navegación).

export type SearchParams = Record<string, string | string[] | undefined>;
export type SortOrder = "asc" | "desc";

export type TableState = {
  q: string;
  page: number;
  pageSize: number;
  sort: string;
  order: SortOrder;
  filters: Record<string, string>;
};

export type TableConfig = {
  sortable: readonly string[];
  defaultSort: string;
  defaultOrder?: SortOrder;
  filters?: readonly string[];
};

export const PAGE_SIZES = [10, 20, 50] as const;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseTableState(searchParams: SearchParams, config: TableConfig): TableState {
  const pageSize = Number(first(searchParams.pageSize));
  const page = Math.floor(Number(first(searchParams.page)));
  const sort = first(searchParams.sort);
  const order = first(searchParams.order);

  const filters: Record<string, string> = {};
  for (const key of config.filters ?? []) {
    const value = first(searchParams[key])?.trim();
    if (value) filters[key] = value.slice(0, 100);
  }

  return {
    q: (first(searchParams.q) ?? "").trim().slice(0, 100),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: (PAGE_SIZES as readonly number[]).includes(pageSize) ? pageSize : PAGE_SIZES[0],
    sort: sort && config.sortable.includes(sort) ? sort : config.defaultSort,
    order: order === "asc" || order === "desc" ? order : (config.defaultOrder ?? "desc"),
    filters,
  };
}

export type TablePatch = Partial<Omit<TableState, "filters">> & { filters?: Record<string, string> };

/** Construye la URL de la tabla aplicando cambios al estado actual. */
export function buildTableHref(basePath: string, state: TableState, patch: TablePatch = {}) {
  const next = { ...state, ...patch, filters: { ...state.filters, ...patch.filters } };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  for (const [key, value] of Object.entries(next.filters)) if (value) params.set(key, value);
  params.set("sort", next.sort);
  params.set("order", next.order);
  if (next.page > 1) params.set("page", String(next.page));
  if (next.pageSize !== PAGE_SIZES[0]) params.set("pageSize", String(next.pageSize));

  return `${basePath}?${params.toString()}`;
}

/** Ajusta la página al rango válido una vez conocido el total. */
export function paginate(state: TableState, total: number) {
  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  const page = Math.min(state.page, totalPages);
  return { page, totalPages, skip: (page - 1) * state.pageSize, take: state.pageSize };
}
