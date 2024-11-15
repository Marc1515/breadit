import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    // Añadir encabezados CORS
    const headers = new Headers();
    headers.append(
      "Access-Control-Allow-Origin",
      "https:breadit.marcespana.com"
    ); // Cambia esto por tu dominio
    headers.append("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.append("Access-Control-Allow-Headers", "Content-Type");

    const body = await req.json();
    const { title, content, subredditId } = PostValidator.parse(body);

    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401, headers });
    }

    // Verificar si el usuario está suscrito al subreddit
    const subscription = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return new Response("Subscribe to post", { status: 403, headers });
    }

    await db.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        subredditId,
      },
    });

    return new Response("OK", { headers });
  } catch (error) {
    const headers = new Headers();
    headers.append(
      "Access-Control-Allow-Origin",
      "https:breadit.marcespana.com"
    ); // Cambia esto por tu dominio

    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400, headers });
    }

    return new Response(
      "Could not post to subreddit at this time. Please try later",
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  // Manejar la solicitud preflight con los encabezados CORS
  const headers = new Headers();
  headers.append("Access-Control-Allow-Origin", "https:breadit.marcespana.com"); // Cambia esto por tu dominio
  headers.append("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.append("Access-Control-Allow-Headers", "Content-Type");

  return new Response(null, { headers });
}
