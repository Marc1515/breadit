import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const eventId = url.searchParams.get("id");

    if (!eventId) {
      return new Response("Event ID is required", { status: 400 });
    }

    // Verificar que el evento pertenezca al usuario autenticado
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.userId !== session.user.id) {
      return new Response("Not authorized to delete this event", {
        status: 403,
      });
    }

    // Eliminar el evento de la base de datos
    await db.event.delete({
      where: { id: eventId },
    });

    return new Response("Event deleted", { status: 200 });
  } catch (error) {
    return new Response("Failed to delete event", { status: 500 });
  }
}
