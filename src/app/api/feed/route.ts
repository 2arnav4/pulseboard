import { getFeedPage } from "@/lib/server/content-service";
import { feedQuerySchema, parseQuery } from "@/lib/server/validation";

/** GET /api/feed?categories=technology,sports&page=1&seed=550 — one page of the unified feed. */
export async function GET(request: Request) {
  const parsed = parseQuery(feedQuerySchema, request.url);
  if (!parsed.ok) return parsed.response;
  const { categories, page, seed } = parsed.data;
  return Response.json(await getFeedPage({ categories, page, seedMovieId: seed }));
}
