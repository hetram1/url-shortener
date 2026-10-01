import { pool } from "../config/database.js";

export interface UrlRecord {
  id: string;
  short_code: string;
  original_url: string;
  created_at: Date;
  expires_at: Date | null;
  click_count: string;
  custom_alias: string | null;
  user_id: string | null;
}

export async function createUrl(
  shortCode: string,
  originalUrl: string,
  expiresAt: Date | null = null,
  customAlias: string | null = null,
  userId: string | null = null,
): Promise<UrlRecord> {
  const result = await pool.query<UrlRecord>(
    `
      INSERT INTO urls (
        short_code,
        original_url,
        expires_at,
        custom_alias,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        short_code,
        original_url,
        created_at,
        expires_at,
        click_count,
        custom_alias,
        user_id
    `,
    [shortCode, originalUrl, expiresAt, customAlias, userId],
  );

  return result.rows[0];
}

export async function findUrlByShortCode(
  shortCode: string,
): Promise<UrlRecord | null> {
  const result = await pool.query<UrlRecord>(
    `
      SELECT
        id,
        short_code,
        original_url,
        created_at,
        expires_at,
        click_count,
        custom_alias
      FROM urls
      WHERE short_code = $1
    `,
    [shortCode],
  );

  return result.rows[0] ?? null;
}

export async function incrementClickCount(
  shortCode: string,
): Promise<void> {
  await pool.query(
    `
      UPDATE urls
      SET click_count = click_count + 1
      WHERE short_code = $1
    `,
    [shortCode],
  );
}

export interface CreateClickEventInput {
  urlId: string;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
}

export async function recordClickEvent(
  input: CreateClickEventInput,
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        INSERT INTO url_clicks (
          url_id,
          ip_address,
          user_agent,
          referrer
        )
        VALUES ($1, $2, $3, $4)
      `,
      [
        input.urlId,
        input.ipAddress,
        input.userAgent,
        input.referrer,
      ],
    );

    await client.query(
      `
        UPDATE urls
        SET click_count = click_count + 1
        WHERE id = $1
      `,
      [input.urlId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export interface UrlAnalytics {
  short_code: string;
  original_url: string;
  created_at: Date;
  click_count: string;
  last_clicked_at: Date | null;
}

export interface ClickEvent {
  id: string;
  clicked_at: Date;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
}

export interface ReferrerCount {
  referrer: string;
  clicks: string;
}

export async function getUrlAnalytics(
  shortCode: string,
): Promise<UrlAnalytics | null> {
  const result = await pool.query<UrlAnalytics>(
    `
      SELECT
        u.short_code,
        u.original_url,
        u.created_at,
        u.click_count,
        MAX(c.clicked_at) AS last_clicked_at
      FROM urls u
      LEFT JOIN url_clicks c
        ON c.url_id = u.id
      WHERE u.short_code = $1
      GROUP BY
        u.id,
        u.short_code,
        u.original_url,
        u.created_at,
        u.click_count
    `,
    [shortCode],
  );

  return result.rows[0] ?? null;
}

export async function getRecentClickEvents(
  shortCode: string,
  limit: number = 20,
): Promise<ClickEvent[]> {
  const result = await pool.query<ClickEvent>(
    `
      SELECT
        c.id,
        c.clicked_at,
        c.ip_address,
        c.user_agent,
        c.referrer
      FROM url_clicks c
      INNER JOIN urls u
        ON u.id = c.url_id
      WHERE u.short_code = $1
      ORDER BY c.clicked_at DESC
      LIMIT $2
    `,
    [shortCode, limit],
  );

  return result.rows;
}

export async function getTopReferrers(
  shortCode: string,
  limit: number = 10,
): Promise<ReferrerCount[]> {
  const result = await pool.query<ReferrerCount>(
    `
      SELECT
        COALESCE(referrer, 'Direct') AS referrer,
        COUNT(*)::text AS clicks
      FROM url_clicks c
      INNER JOIN urls u
        ON u.id = c.url_id
      WHERE u.short_code = $1
      GROUP BY COALESCE(referrer, 'Direct')
      ORDER BY COUNT(*) DESC
      LIMIT $2
    `,
    [shortCode, limit],
  );

  return result.rows;
}


export interface UserUrlListOptions {
  limit: number;
  offset: number;
}

export async function findUrlsByUserId(
  userId: string,
  options: UserUrlListOptions,
): Promise<UrlRecord[]> {
  const result = await pool.query<UrlRecord>(
    `
      SELECT
        id,
        short_code,
        original_url,
        created_at,
        expires_at,
        click_count,
        custom_alias,
        user_id
      FROM urls
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      OFFSET $3
    `,
    [userId, options.limit, options.offset],
  );

  return result.rows;
}
