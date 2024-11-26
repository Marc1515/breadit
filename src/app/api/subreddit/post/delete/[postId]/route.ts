import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Función para garantizar que la carpeta 'audio' exista
function ensureAudioDirectoryExists() {
  const audioDir = path.join(process.cwd(), "public", "audio");

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    console.log(`Audio directory created: ${audioDir}`);
  }
}

// Función para eliminar el archivo de audio si existe
function deleteAudioFile(audioUrl: string | null) {
  if (!audioUrl) return;

  const audioPath = path.join(process.cwd(), "public", audioUrl);

  try {
    // Asegurarnos de que es un archivo
    if (fs.existsSync(audioPath) && fs.lstatSync(audioPath).isFile()) {
      fs.unlinkSync(audioPath);
      console.log(`Audio file deleted: ${audioPath}`);
    } else {
      console.warn(`Path is not a file or does not exist: ${audioPath}`);
    }
  } catch (err) {
    console.error(`Error deleting audio file (${audioUrl}):`, err);
  }
}

// Función recursiva para eliminar comentarios, respuestas y audios
async function deleteCommentReplies(commentId: string) {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    console.warn(`Comment with ID ${commentId} not found, skipping deletion.`);
    return;
  }

  // Eliminar el archivo de audio asociado al comentario
  deleteAudioFile(comment.audioUrl);

  // Obtener las respuestas del comentario
  const replies = await db.comment.findMany({
    where: { replyToId: commentId },
  });

  // Eliminar las respuestas recursivamente
  for (const reply of replies) {
    await deleteCommentReplies(reply.id);
  }

  // Eliminar el comentario principal después de sus respuestas
  try {
    await db.comment.delete({
      where: { id: commentId },
    });
  } catch (error) {
    console.warn(`Failed to delete comment (${commentId}):`, error);
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

  // Eliminar recursivamente todos los comentarios, respuestas y sus audios
  for (const comment of comments) {
    await deleteCommentReplies(comment.id);
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
