import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Excluir rutas de UploadThing
  if (req.nextUrl.pathname.startsWith("/api/uploadthing")) {
    return NextResponse.next(); // Permitir el paso sin autenticación
  }

  // Verificar token para rutas protegidas
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }
}

// Configuración de las rutas protegidas y exclusión de UploadThing
export const config = {
  matcher: [
    "/r/:path*/submit",
    "/r/create",
    // Excluir explícitamente la ruta de UploadThing
    "!/api/uploadthing/:path*",
  ],
};
