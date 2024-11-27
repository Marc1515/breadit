import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const method = req.method;

  console.log("Middleware triggered for:", pathname, "Method:", method);

  // Permitir rutas públicas y solicitudes hacia /api/uploadthing
  const publicPaths = ["/", "/sign-in", "/sign-up", "/sign-out"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublicPath || pathname.startsWith("/api/uploadthing")) {
    console.log("Public or uploadthing path allowed.");
    return NextResponse.next();
  }

  // Manejar solicitudes preflight (OPTIONS)
  if (method === "OPTIONS") {
    console.log("Preflight request allowed.");
    return NextResponse.next();
  }

  // Verificar token de sesión para rutas protegidas
  const token = await getToken({ req });
  console.log("Token:", token ? "Valid" : "Missing");

  if (!token) {
    console.log("Redirecting to /sign-in.");
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  return NextResponse.next();
}
