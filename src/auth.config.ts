import type { NextAuthConfig } from "next-auth";
import { AVATAR_COLORS, type AvatarColor } from "@/types/user";

function isAvatarColor(value: unknown): value is AvatarColor {
  return typeof value === "string" && (AVATAR_COLORS as readonly string[]).includes(value);
}

/**
 * Provider-free config shared by the proxy and the full auth setup in auth.ts.
 * Keeping database and bcrypt imports out of here keeps the proxy bundle small.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.avatarColor = isAvatarColor(user.avatarColor) ? user.avatarColor : "indigo";
      }
      // Profile edits call useSession().update(...) so the header reflects them without re-login.
      if (trigger === "update" && session && typeof session === "object") {
        const update = session as { name?: unknown; avatarColor?: unknown };
        if (typeof update.name === "string") token.name = update.name;
        if (isAvatarColor(update.avatarColor)) token.avatarColor = update.avatarColor;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.avatarColor = isAvatarColor(token.avatarColor) ? token.avatarColor : "indigo";
      return session;
    },
  },
} satisfies NextAuthConfig;
