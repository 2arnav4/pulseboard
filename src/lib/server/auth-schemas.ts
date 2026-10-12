import "server-only";
import { z } from "zod";
import { AVATAR_COLORS } from "./users/types";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  email: z.email("Enter a valid email address").max(254),
  // bcrypt only uses the first 72 bytes, so longer passwords are rejected rather than silently truncated.
  password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password must be at most 72 characters"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  bio: z.string().trim().max(160, "Bio must be at most 160 characters"),
  avatarColor: z.enum(AVATAR_COLORS),
});

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
