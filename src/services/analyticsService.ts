import {
  getRecentClickEvents,
  getTopReferrers,
  getUrlAnalytics,
} from "../repositories/urlRepository.js";

export async function getAnalytics(shortCode: string, userId: string) {
  const analytics = await getUrlAnalytics(shortCode, userId);

  if (!analytics) {
    return null;
  }

  const [recentClicks, topReferrers] = await Promise.all([
    getRecentClickEvents(shortCode),
    getTopReferrers(shortCode),
  ]);

  return {
    shortCode: analytics.short_code,
    originalUrl: analytics.original_url,
    createdAt: analytics.created_at,
    clickCount: analytics.click_count,
    lastClickedAt: analytics.last_clicked_at,
    topReferrers,
    recentClicks,
  };
}
