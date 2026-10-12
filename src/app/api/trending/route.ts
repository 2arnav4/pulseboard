import { getTrending } from "@/lib/server/content-service";
import { parseQuery, trendingQuerySchema } from "@/lib/server/validation";

/** GET /api/trending?source=news|movie|social */
export async function GET(request: Request) {
  const parsed = parseQuery(trendingQuerySchema, request.url);
  if (!parsed.ok) return parsed.response;
  return Response.json(await getTrending(parsed.data.source));
}
