import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

// Crear instancia de UploadThing
const f = createUploadthing();

// Función de autenticación ficticia
const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// Configurar FileRouter con slug 'imageUploader'
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Middleware para verificar autenticación y permisos
    .middleware(async ({ req }) => {
      const user = await auth(req);

      if (!user) {
        console.error("Error: Usuario no autorizado");
        throw new UploadThingError("Unauthorized");
      }

      console.log("Usuario autenticado con éxito:", user.id);

      return { userId: user.id };
    })
    // Callback que se ejecuta después de la subida
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Callback recibido por UploadThing:");
      console.log("Metadata:", metadata);
      console.log("Archivo subido:", file);

      if (!file.url) {
        console.error("Error: la URL del archivo no está presente.");
        throw new Error("La URL del archivo subido no está disponible.");
      }

      console.log(
        "Subida completada exitosamente para el usuario:",
        metadata.userId
      );

      // Si necesitas guardar la URL del archivo o notificar, hazlo aquí
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Configuración explícita del callbackUrl
export const config = {
  callbackUrl: process.env.UPLOADTHING_URL || "https://breadit.marcespana.com",
};
