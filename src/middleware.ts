import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

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

  // Permitir acceso a rutas públicas y la API de UploadThing
  if (isPublicPath || pathname.startsWith("/api/uploadthing")) {
    return NextResponse.next();
  }

  // Verificar token de sesión para todas las demás rutas
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  return NextResponse.next();
}
