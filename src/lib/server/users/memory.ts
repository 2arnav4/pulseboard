import "server-only";
import { DuplicateEmailError, type UserRecord, type UserRepository } from "./types";

/**
 * Fallback used when DATABASE_URL is not set (local dev without a database, E2E tests).
 * Data lives in process memory and is lost on restart; on serverless hosts each
 * instance has its own copy, which is why production uses Postgres.
 */
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, UserRecord>();

  async findByEmail(email: string): Promise<UserRecord | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) ?? null;
  }

  async create(input: { email: string; name: string; passwordHash: string }): Promise<UserRecord> {
    if (await this.findByEmail(input.email)) throw new DuplicateEmailError();
    const user: UserRecord = {
      id: crypto.randomUUID(),
      ...input,
      bio: "",
      avatarColor: "indigo",
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateProfile(id: string, update: Pick<UserRecord, "name" | "bio" | "avatarColor">): Promise<UserRecord | null> {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...update };
    this.users.set(id, updated);
    return updated;
  }
}
