import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Permitir todas las solicitudes hacia /api/uploadthing
  if (pathname.startsWith("/api/uploadthing")) {
    return NextResponse.next();
  }

  // Verificar token para otras rutas
  const token = await getToken({ req });
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }

  return NextResponse.next();
}
