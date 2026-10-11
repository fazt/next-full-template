/**
 * URL pública de la app para enlaces absolutos (correos, push).
 * En producción se exige NEXTAUTH_URL: derivarla del header Host permitiría
 * que un atacante envíe enlaces de recuperación a su propio dominio.
 */
export function getAppUrl(request?: Request) {
  const configured = process.env.NEXTAUTH_URL;
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.NODE_ENV !== "production" && request) return new URL(request.url).origin;
  throw new Error("Define NEXTAUTH_URL para generar enlaces absolutos");
}
