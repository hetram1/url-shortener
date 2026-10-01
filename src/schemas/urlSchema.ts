import { z } from "zod";

export const createUrlSchema = z.object({
  originalUrl: z.string(),
  customAlias: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
