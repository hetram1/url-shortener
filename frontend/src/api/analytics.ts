import { apiRequest } from "./client";

export interface ReferrerCount {
  referrer: string;
  clicks: number | string;
}

export interface RecentClick {
  id: number | string;
  clicked_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
}

export interface UrlAnalytics {
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number | string;
  lastClickedAt: string | null;
  topReferrers: ReferrerCount[];
  recentClicks: RecentClick[];
}

export async function getUrlAnalytics(
  shortCode: string,
): Promise<UrlAnalytics> {
  return apiRequest<UrlAnalytics>(
    `/urls/${encodeURIComponent(shortCode)}/analytics`,
  );
}
