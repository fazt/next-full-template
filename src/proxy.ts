import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { DEFAULT_LOGIN_REDIRECT, GUEST_ONLY_ROUTES, isAdminRoute } from "@/config/routes";

// Next 16: `middleware` pasó a llamarse `proxy` (runtime Node.js).
// Es una comprobación optimista basada en el JWT; las páginas y la API
// vuelven a validar sesión y rol contra la base de datos.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(url);
    }
    if (token.role !== "ADMIN" && isAdminRoute(pathname)) {
      return NextResponse.redirect(new URL("/dashboard?denied=1", request.url));
    }
    return NextResponse.next();
  }

  if (token && GUEST_ONLY_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/signin", "/auth/register"],
};
