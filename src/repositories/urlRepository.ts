import { pool } from "../config/database.js";

export interface UrlRecord {
  id: string;
  short_code: string;
  original_url: string;
  created_at: Date;
  expires_at: Date | null;
  click_count: string;
  custom_alias: string | null;
}

export async function createUrl(
  shortCode: string,
  originalUrl: string,
  expiresAt: Date | null = null,
  customAlias: string | null = null,
): Promise<UrlRecord> {
  const result = await pool.query<UrlRecord>(
    `
      INSERT INTO urls (
        short_code,
        original_url,
        expires_at,
        custom_alias
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        short_code,
        original_url,
        created_at,
        expires_at,
        click_count,
        custom_alias
    `,
    [shortCode, originalUrl, expiresAt, customAlias],
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
