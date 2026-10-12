import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const AUTH_PAGES = ["/login", "/signup"];
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/register"];

/**
 * Optimistic session check before any page or data route runs:
 * signed-out users are sent to /login (pages) or get a 401 (APIs),
 * which also stops anonymous visitors from spending the NewsAPI quota.
 */
export default auth((request) => {
  const { pathname, search } = request.nextUrl;
  const signedIn = Boolean(request.auth?.user);

  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return NextResponse.next();

  if (AUTH_PAGES.includes(pathname)) {
    return signedIn ? NextResponse.redirect(new URL("/", request.nextUrl)) : NextResponse.next();
  }

  if (signedIn) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.nextUrl);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
