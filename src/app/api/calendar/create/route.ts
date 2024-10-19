import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventValidator } from "@/lib/validators/events";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validar los datos recibidos
    const { title, start, end } = EventValidator.parse(body);

    // Obtener la sesión del usuario
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Guardar el evento en la base de datos
    await db.event.create({
      data: {
        title,
        start: new Date(start),
        end: new Date(end),
        userId: session.user.id, // Relacionar el evento con el usuario
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(
      "Could not create event at this time. Please try again later",
      { status: 500 }
    );
  }
}
