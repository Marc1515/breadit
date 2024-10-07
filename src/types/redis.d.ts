import { Vote } from "@prisma/client";

export type CachedPost = {
  id: string;
  title: string;
  authorId: string; // Añadir `authorId` a CachedPost
  authorUsername: string;
  content: string;
  currentVote: Vote["type"] | null;
  createdAt: Date;
};
