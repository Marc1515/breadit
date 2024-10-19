import { z } from "zod";

export const EventValidator = z.object({
  title: z.string().min(1),
  start: z.string().datetime(), // Espera cadenas de fecha en formato ISO
  end: z.string().datetime(), // Igual que arriba
});
