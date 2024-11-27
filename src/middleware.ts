import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const method = req.method;

  // Permitir todas las solicitudes hacia /api/uploadthing
  if (pathname.startsWith("/api/uploadthing")) {
    return NextResponse.next();
  }

  // Manejar solicitudes preflight (OPTIONS)
  if (method === "OPTIONS") {
    return NextResponse.next();
  }

  // Rutas públicas que no requieren autenticación
  const publicPaths = [
    "/",
    "/sign-in",
    "/sign-out",
    "/sign-up",
    "/about",
    "/contact",
  ];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verificar token de sesión para todas las demás rutas
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  return NextResponse.next();
}
