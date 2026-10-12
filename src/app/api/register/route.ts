import { firstIssue, registerSchema } from "@/lib/server/auth-schemas";
import { DuplicateEmailError, getUserRepository, hashPassword, normalizeEmail, toPublicUser } from "@/lib/server/users";

/** POST /api/register { name, email, password } — creates an account; the client then signs in. */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: firstIssue(parsed.error) }, { status: 400 });

  const { name, email, password } = parsed.data;
  try {
    const user = await getUserRepository().create({
      name,
      email: normalizeEmail(email),
      passwordHash: await hashPassword(password),
    });
    return Response.json({ user: toPublicUser(user) }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateEmailError) return Response.json({ error: error.message }, { status: 409 });
    console.error("[register] failed:", error);
    return Response.json({ error: "Could not create the account. Try again." }, { status: 500 });
  }
}
