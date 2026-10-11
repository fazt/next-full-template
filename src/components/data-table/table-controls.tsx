"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { buildTableHref, PAGE_SIZES, type TablePatch, type TableState } from "@/libs/table";

export type FilterOption = { value: string; label: string };
export type FilterDef = { key: string; label: string; options: FilterOption[] };

function useTableNavigation(basePath: string, state: TableState) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigate = (patch: TablePatch) =>
    startTransition(() => router.replace(buildTableHref(basePath, state, patch), { scroll: false }));
  return { navigate, isPending, router, startTransition };
}

export function TableSearch({
  basePath,
  state,
  placeholder = "Buscar…",
}: {
  basePath: string;
  state: TableState;
  placeholder?: string;
}) {
  const { isPending, router, startTransition } = useTableNavigation(basePath, state);
  const [value, setValue] = useState(state.q);

  // Búsqueda con debounce de 300 ms; el cleanup cancela si se sigue escribiendo
  useEffect(() => {
    const q = value.trim();
    if (q === state.q) return;
    const timer = setTimeout(() => {
      startTransition(() =>
        router.replace(buildTableHref(basePath, state, { q, page: 1 }), { scroll: false }),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [value, state, basePath, router, startTransition]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
      />
      {isPending && (
        <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
      )}
    </div>
  );
}

export function TableFilter({
  basePath,
  state,
  filter,
}: {
  basePath: string;
  state: TableState;
  filter: FilterDef;
}) {
  const { navigate } = useTableNavigation(basePath, state);
  return (
    <Select
      aria-label={`Filtrar por ${filter.label.toLowerCase()}`}
      value={state.filters[filter.key] ?? ""}
      onChange={(event) => navigate({ filters: { [filter.key]: event.target.value }, page: 1 })}
      className="sm:w-48"
    >
      <option value="">{filter.label}: todos</option>
      {filter.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}

export function PageSizeSelect({ basePath, state }: { basePath: string; state: TableState }) {
  const { navigate } = useTableNavigation(basePath, state);
  return (
    <Select
      aria-label="Filas por página"
      value={state.pageSize}
      onChange={(event) => navigate({ pageSize: Number(event.target.value), page: 1 })}
      className="h-8 w-auto text-xs"
    >
      {PAGE_SIZES.map((size) => (
        <option key={size} value={size}>
          {size} por página
        </option>
      ))}
    </Select>
  );
}
