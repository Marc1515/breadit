import { db } from "@/lib/db";

export async function GET() {
  try {
    const events = await db.event.findMany({
      orderBy: { start: "asc" },
    });

    return new Response(JSON.stringify(events), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0", // Desactiva la caché completamente
      },
    });
  } catch (error) {
    return new Response("Failed to fetch events", { status: 500 });
  }
}
