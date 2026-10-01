import { pool } from "../config/database.js";

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export async function findUserByEmail(
  email: string,
): Promise<UserRecord | null> {
  const result = await pool.query<UserRecord>(
    `
      SELECT
        id,
        email,
        password_hash,
        created_at,
        updated_at
      FROM users
      WHERE email = $1
    `,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string,
): Promise<UserRecord> {
  const result = await pool.query<UserRecord>(
    `
      INSERT INTO users (
        email,
        password_hash
      )
      VALUES ($1, $2)
      RETURNING
        id,
        email,
        password_hash,
        created_at,
        updated_at
    `,
    [email, passwordHash],
  );

  return result.rows[0];
}
