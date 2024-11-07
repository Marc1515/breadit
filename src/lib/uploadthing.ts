import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Esto genera los helpers necesarios para manejar las subidas de archivos
export const { uploadFiles } = generateReactHelpers<OurFileRouter>();
