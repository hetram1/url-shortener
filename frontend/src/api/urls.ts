import { apiRequest } from "./client";

export interface ShortUrl {
  id: number;
  shortCode: string;
  originalUrl: string;
  customAlias: string | null;
  createdAt: string;
  expiresAt: string | null;
  clickCount: number;
}

interface CreateUrlResponse {
  id: number;
  shortCode: string;
  originalUrl: string;
  customAlias: string | null;
  createdAt: string;
  expiresAt: string | null;
  clickCount: number;
}

export async function createUrl(
  originalUrl: string,
  customAlias?: string,
): Promise<ShortUrl> {
  const response = await apiRequest<CreateUrlResponse>("/urls", {
    method: "POST",
    body: JSON.stringify({
      originalUrl,
      customAlias: customAlias || undefined,
    }),
  });

  return {
    id: response.id,
    shortCode: response.shortCode,
    originalUrl: response.originalUrl,
    customAlias: response.customAlias,
    createdAt: response.createdAt,
    expiresAt: response.expiresAt,
    clickCount: response.clickCount,
  };
}
