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

export interface UrlPagination {
  limit: number;
  offset: number;
  count: number;
}

export interface PaginatedUrls {
  urls: ShortUrl[];
  pagination: UrlPagination;
}

export async function getUrls(
  limit = 5,
  offset = 0,
): Promise<PaginatedUrls> {
  return apiRequest<PaginatedUrls>(
    `/urls?limit=${limit}&offset=${offset}`,
  );
}

export async function updateUrl(
  shortCode: string,
  originalUrl: string,
  customAlias?: string,
): Promise<ShortUrl> {
  const response = await apiRequest<CreateUrlResponse>(
    `/urls/${encodeURIComponent(shortCode)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        originalUrl,
        customAlias: customAlias || undefined,
      }),
    },
  );

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

export async function deleteUrl(shortCode: string): Promise<void> {
  await apiRequest<void>(
    `/urls/${encodeURIComponent(shortCode)}`,
    {
      method: "DELETE",
    },
  );
}
