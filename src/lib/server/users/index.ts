import "server-only";
import bcrypt from "bcryptjs";
import { serverEnv } from "../env";
import { InMemoryUserRepository } from "./memory";
import { PostgresUserRepository } from "./postgres";
import type { UserRecord, UserRepository } from "./types";

const BCRYPT_ROUNDS = 10;

/** Public demo account so reviewers can sign in without registering. */
export const DEMO_USER = { email: "demo@pulseboard.app", password: "pulseboard-demo", name: "Demo User" } as const;

// Cached on globalThis so dev-server hot reloads do not wipe the in-memory store.
const globalForUsers = globalThis as typeof globalThis & { pulseboardUsers?: UserRepository };

export function getUserRepository(): UserRepository {
  globalForUsers.pulseboardUsers ??= serverEnv.databaseUrl
    ? new PostgresUserRepository(serverEnv.databaseUrl)
    : new InMemoryUserRepository();
  return globalForUsers.pulseboardUsers;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

let dummyHash: Promise<string> | null = null;

async function ensureDemoUser(repository: UserRepository): Promise<void> {
  if (await repository.findByEmail(DEMO_USER.email)) return;
  try {
    await repository.create({ email: DEMO_USER.email, name: DEMO_USER.name, passwordHash: await hashPassword(DEMO_USER.password) });
  } catch {
    // Another request created it concurrently; nothing to do.
  }
}

/**
 * Returns the user when the email/password pair is valid, otherwise null.
 * bcrypt.compare runs even for unknown emails so response time does not reveal which emails exist.
 */
export async function verifyCredentials(email: string, password: string): Promise<UserRecord | null> {
  const repository = getUserRepository();
  const normalized = normalizeEmail(email);
  if (normalized === DEMO_USER.email) await ensureDemoUser(repository);
  const user = await repository.findByEmail(normalized);
  dummyHash ??= hashPassword("timing-equalizer");
  const valid = await bcrypt.compare(password, user?.passwordHash ?? (await dummyHash));
  return user && valid ? user : null;
}

export * from "./types";
