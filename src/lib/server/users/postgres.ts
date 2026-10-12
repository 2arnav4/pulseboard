import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { AVATAR_COLORS, DuplicateEmailError, type AvatarColor, type ProfileUpdate, type UserRecord, type UserRepository } from "./types";

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  bio: string;
  avatar_color: string;
  created_at: string | Date;
}

const UNIQUE_VIOLATION = "23505";

function toRecord(row: UserRow): UserRecord {
  const avatarColor = (AVATAR_COLORS as readonly string[]).includes(row.avatar_color) ? (row.avatar_color as AvatarColor) : "indigo";
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    bio: row.bio,
    avatarColor,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/** Users stored in Postgres (Neon) over its HTTP driver, which suits short-lived serverless functions. */
export class PostgresUserRepository implements UserRepository {
  private readonly sql: NeonQueryFunction<false, false>;
  private schemaReady: Promise<void> | null = null;

  constructor(connectionString: string) {
    this.sql = neon(connectionString);
  }

  /** Idempotent table creation (mirrors db/schema.sql) so a fresh database works without a migration step. */
  private ensureSchema(): Promise<void> {
    this.schemaReady ??= this.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        bio TEXT NOT NULL DEFAULT '',
        avatar_color TEXT NOT NULL DEFAULT 'indigo',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`.then(() => undefined);
    return this.schemaReady;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    await this.ensureSchema();
    const rows = (await this.sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`) as UserRow[];
    return rows[0] ? toRecord(rows[0]) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    await this.ensureSchema();
    const rows = (await this.sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`) as UserRow[];
    return rows[0] ? toRecord(rows[0]) : null;
  }

  async create(input: { email: string; name: string; passwordHash: string }): Promise<UserRecord> {
    await this.ensureSchema();
    try {
      const rows = (await this.sql`
        INSERT INTO users (email, name, password_hash)
        VALUES (${input.email}, ${input.name}, ${input.passwordHash})
        RETURNING *`) as UserRow[];
      return toRecord(rows[0]);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === UNIQUE_VIOLATION) throw new DuplicateEmailError();
      throw error;
    }
  }

  async updateProfile(id: string, update: ProfileUpdate): Promise<UserRecord | null> {
    await this.ensureSchema();
    const rows = (await this.sql`
      UPDATE users SET name = ${update.name}, bio = ${update.bio}, avatar_color = ${update.avatarColor}
      WHERE id = ${id}
      RETURNING *`) as UserRow[];
    return rows[0] ? toRecord(rows[0]) : null;
  }
}
