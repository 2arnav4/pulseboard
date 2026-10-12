import { getSocialPosts } from "@/lib/server/social";
import { parseQuery, socialQuerySchema } from "@/lib/server/validation";

/** GET /api/social?category=sports&q=%23cricket&page=1 — the mock social media API. */
export async function GET(request: Request) {
  const parsed = parseQuery(socialQuerySchema, request.url);
  if (!parsed.ok) return parsed.response;
  const { category, q, page } = parsed.data;
  const result = getSocialPosts({ categories: category ? [category] : [], page, pageSize: 10, query: q });
  return Response.json({ items: result.items, page, hasMore: result.hasMore, sources: { social: result.status } });
}
