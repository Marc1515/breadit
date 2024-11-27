import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const method = req.method;

  // Manejar solicitudes preflight (OPTIONS)
  if (method === "OPTIONS") {
    return NextResponse.next();
  }

  // Permitir acceso a rutas públicas y la API de UploadThing
  const publicPaths = ["/", "/sign-in", "/sign-up", "/about", "/contact"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublicPath || pathname.startsWith("/api/uploadthing")) {
    return NextResponse.next(); // Permitir continuar sin autenticación
  }

  // Verificar token de sesión
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  return NextResponse.next();
}
