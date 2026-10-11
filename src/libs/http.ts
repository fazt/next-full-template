import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export type ApiFailure = {
  ok: false;
  status: number;
  error: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type ApiResult<T> = { ok: true; data: T } | ApiFailure;

/** fetch con JSON y errores normalizados para usar desde el cliente. */
export async function apiRequest<T = unknown>(
  url: string,
  { method = "POST", body }: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data?.error ?? "Ocurrió un error inesperado",
        fieldErrors: data?.fieldErrors,
      };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, error: "No se pudo conectar con el servidor" };
  }
}

/** Copia los errores por campo devueltos por la API al formulario. */
export function applyFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors?: Record<string, string[] | undefined>,
) {
  let applied = false;
  for (const [field, messages] of Object.entries(fieldErrors ?? {})) {
    if (messages?.[0]) {
      setError(field as Path<T>, { type: "server", message: messages[0] });
      applied = true;
    }
  }
  return applied;
}
