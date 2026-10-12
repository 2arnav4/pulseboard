export const AVATAR_COLORS = ["indigo", "emerald", "rose", "amber", "sky", "violet"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  bio: string;
  avatarColor: AvatarColor;
  createdAt: string;
}

/** What the browser is allowed to see: never the password hash. */
export type PublicUser = Omit<UserRecord, "passwordHash">;

export interface ProfileUpdate {
  name: string;
  bio: string;
  avatarColor: AvatarColor;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  /** Throws DuplicateEmailError when the email is taken. */
  create(input: { email: string; name: string; passwordHash: string }): Promise<UserRecord>;
  updateProfile(id: string, update: ProfileUpdate): Promise<UserRecord | null>;
}

export class DuplicateEmailError extends Error {
  constructor() {
    super("An account with this email already exists");
    this.name = "DuplicateEmailError";
  }
}

export function toPublicUser({ passwordHash: _passwordHash, ...user }: UserRecord): PublicUser {
  return user;
}
