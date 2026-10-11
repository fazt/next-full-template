/** Rutas solo para administradores (el proxy y las páginas las comprueban). */
export const ADMIN_ROUTE_PATTERNS = [
  /^\/dashboard\/users(\/.*)?$/,
  /^\/dashboard\/(products|categories)\/new\/?$/,
  /^\/dashboard\/(products|categories)\/[^/]+\/edit\/?$/,
];

/** Páginas de acceso: si ya hay sesión se redirige al dashboard. */
export const GUEST_ONLY_ROUTES = ["/auth/signin", "/auth/register"];

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export function isAdminRoute(pathname: string) {
  return ADMIN_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

/** Acepta solo rutas internas para evitar redirecciones abiertas. */
export function safeCallbackUrl(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return DEFAULT_LOGIN_REDIRECT;
  }
  return value;
}
