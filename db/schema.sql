-- Users for NextAuth credentials sign-in. The app also runs this idempotently on first use
-- (src/lib/server/users/postgres.ts), so applying it by hand is optional.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,          -- stored lower-cased
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,         -- bcrypt, 10 rounds
  bio TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT 'indigo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
