import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Función recursiva para eliminar comentarios y sus respuestas
async function deleteCommentReplies(commentId: string) {
  // Verificar si el comentario aún existe antes de intentar eliminarlo
  const comment = await db.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    console.warn(`Comment with ID ${commentId} not found, skipping deletion.`);
    return; // Si el comentario no existe, no intentamos eliminarlo
  }

  // Obtener las respuestas del comentario
  const replies = await db.comment.findMany({
    where: { replyToId: commentId },
  });

  // Eliminar las respuestas recursivamente
  for (const reply of replies) {
    await deleteCommentReplies(reply.id); // Llamada recursiva para eliminar respuestas anidadas
  }

  // Eliminar el comentario principal después de eliminar las respuestas
  try {
    await db.comment.delete({
      where: { id: commentId },
    });
  } catch (error) {
    if (error) {
      console.warn(`Comment with ID ${commentId} not found during deletion.`);
    } else {
      throw error; // Si el error no es P2025, lanzarlo de nuevo
    }
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verificar si el post existe y si el usuario es el autor
  const post = await db.post.findFirst({
    where: {
      id: params.postId,
      authorId: session.user.id,
    },
  });

  if (!post) {
    return NextResponse.json(
      { error: "Post not found or you are not the author" },
      { status: 404 }
    );
  }

  // Obtener los comentarios asociados al post
  const comments = await db.comment.findMany({
    where: { postId: params.postId },
  });

  // Eliminar recursivamente todos los comentarios y sus respuestas
  for (const comment of comments) {
    await deleteCommentReplies(comment.id); // Eliminar comentarios y respuestas
  }

  // Finalmente, eliminar el post después de eliminar todos los comentarios y respuestas
  await db.post.delete({
    where: { id: params.postId },
  });

  return NextResponse.json(
    { message: "Post deleted successfully" },
    { status: 200 }
  );
}
