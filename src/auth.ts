import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { verifyCredentials } from "@/lib/server/users";

const credentialsSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(72),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /** Returning null makes NextAuth reject the sign-in with a generic CredentialsSignin error. */
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await verifyCredentials(parsed.data.email, parsed.data.password);
        if (!user) return null;
        return { id: user.id, email: user.email, name: user.name, avatarColor: user.avatarColor };
      },
    }),
  ],
});
