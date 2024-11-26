import { NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { Readable } from "stream";
import type { IncomingMessage } from "http";

// Configuración para desactivar el bodyParser de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// Función para envolver el objeto Request de Next.js
function convertRequestToIncomingMessage(req: Request): IncomingMessage {
  const body = req.body as ReadableStream<Uint8Array>;
  const reader = body.getReader();

  const stream = new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(value);
      }
    },
  });

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Crear un objeto completo de tipo IncomingMessage
  return Object.assign(stream, {
    headers,
    method: req.method,
    url: req.url,
    httpVersion: "1.1",
    httpVersionMajor: 1,
    httpVersionMinor: 1,
    connection: {}, // Simular una conexión vacía
    socket: {}, // Simular un socket vacío
    aborted: false,
  }) as IncomingMessage;
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const form = new IncomingForm({
      uploadDir: "./public/audio", // Directorio donde se guardarán los audios
      keepExtensions: true, // Mantener la extensión del archivo
    });

    const incomingMessage = convertRequestToIncomingMessage(req);

    // Promesa para manejar formidable
    const parseForm = () =>
      new Promise<{ fields: any; files: any }>((resolve, reject) => {
        form.parse(incomingMessage, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

    const { fields, files } = await parseForm();

    // **Normalizar los campos recibidos**
    const normalizedFields = Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [
        key,
        Array.isArray(value) ? value[0] : value,
      ])
    );

    // Validar los campos del formulario
    const { postId, text, replyToId } =
      CommentValidator.parse(normalizedFields);

    let audioUrl = null;

    // Manejo del archivo de audio
    if (files.audio) {
      const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;
      const uniqueName = `${Date.now()}-${file.originalFilename}`;
      const audioPath = path.join(process.cwd(), "public/audio", uniqueName);

      fs.renameSync(file.filepath, audioPath);
      audioUrl = `/audio/${uniqueName}`;
    }

    // Guardar en la base de datos
    await db.comment.create({
      data: {
        text,
        postId,
        replyToId,
        authorId: session.user.id,
        audioUrl,
      },
    });

    return NextResponse.json({ message: "Comment created successfully" });
  } catch (err) {
    console.error("Error handling the request:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
