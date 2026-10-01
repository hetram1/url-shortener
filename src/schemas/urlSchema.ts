import { z } from "zod";

export const createUrlSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, "originalUrl is required")
    .url("originalUrl must be a valid URL"),

  customAlias: z
    .string()
    .trim()
    .min(3, "Custom alias must be between 3 and 50 characters")
    .max(50, "Custom alias must be between 3 and 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Custom alias can only contain letters, numbers, hyphens, and underscores",
    )
    .nullable()
    .optional(),

  expiresAt: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .optional(),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
