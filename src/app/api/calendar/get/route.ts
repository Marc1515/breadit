import { db } from "@/lib/db";

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
      },
    });
  } catch (error) {
    return new Response("Failed to fetch events", { status: 500 });
  }
}
