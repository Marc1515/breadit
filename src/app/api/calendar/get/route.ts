import { db } from "@/lib/db";

export const fetchCache = "force-no-store"; // Desactiva la caché globalmente para las solicitudes fetch en esta ruta

export async function GET() {
  try {
    // Obtener todos los eventos (independientemente de si el usuario está autenticado)
    const events = await db.event.findMany({
      orderBy: { start: "asc" },
    });

    return new Response(JSON.stringify(events), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store", // Desactiva la caché en la respuesta
      },
    });
  } catch (error) {
    return new Response("Failed to fetch events", { status: 500 });
  }
}
