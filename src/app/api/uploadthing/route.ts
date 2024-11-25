import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export routes para Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    callbackUrl:
      process.env.UPLOADTHING_URL || "https://breadit.marcespana.com",
    logLevel: "Debug", // Para mayor detalle en los logs
  },
});
