import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(req: Request) {
  try {
    // Obtener el ID del comentario de los parámetros de la solicitud
    const url = new URL(req.url);
    const commentId = url.searchParams.get("id");

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    // Obtener la sesión del usuario autenticado
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener el estado de administrador desde la base de datos
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verificar si el comentario pertenece al usuario o si es administrador
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, audioUrl: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.authorId !== session.user.id && !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Eliminar el archivo de audio si existe
    if (comment.audioUrl) {
      const audioPath = path.join(process.cwd(), "public", comment.audioUrl);

      try {
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
      } catch (err) {
        console.error("Error deleting audio file:", err);
      }
    }

    // Eliminar el comentario de la base de datos
    await db.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
