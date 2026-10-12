import { auth } from "@/auth";
import { firstIssue, profileSchema } from "@/lib/server/auth-schemas";
import { getUserRepository, toPublicUser } from "@/lib/server/users";

/** GET /api/profile — the signed-in user's profile (never includes the password hash). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserRepository().findById(session.user.id);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });
  return Response.json({ user: toPublicUser(user) });
}

/** PATCH /api/profile { name, bio, avatarColor } — users can only edit their own profile. */
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: firstIssue(parsed.error) }, { status: 400 });

  const user = await getUserRepository().updateProfile(session.user.id, parsed.data);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });
  return Response.json({ user: toPublicUser(user) });
}
