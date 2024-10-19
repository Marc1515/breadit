import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Obtener todos los eventos del usuario
    const events = await db.event.findMany({
      where: { userId: session.user.id },
      orderBy: { start: "asc" }, // Opcional: orden por fecha de inicio
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
