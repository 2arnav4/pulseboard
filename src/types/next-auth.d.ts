import type { DefaultSession } from "next-auth";
import type { AvatarColor } from "@/lib/server/users/types";

declare module "next-auth" {
  interface Session {
    user: { id: string; avatarColor: AvatarColor } & DefaultSession["user"];
  }

  interface User {
    avatarColor?: AvatarColor;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    avatarColor?: AvatarColor;
  }
}
