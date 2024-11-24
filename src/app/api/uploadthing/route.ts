import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Configuración personalizada para UploadThing
  config: {
    callbackUrl:
      process.env.UPLOADTHING_URL || "https://breadit.marcespana.com",
  },
});
