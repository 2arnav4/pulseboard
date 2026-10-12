import { searchContent } from "@/lib/server/content-service";
import { parseQuery, searchQuerySchema } from "@/lib/server/validation";

/** GET /api/search?q=mars&type=all|news|movie|social&page=1 */
export async function GET(request: Request) {
  const parsed = parseQuery(searchQuerySchema, request.url);
  if (!parsed.ok) return parsed.response;
  const { q, type, page } = parsed.data;
  return Response.json(await searchContent({ query: q, scope: type, page }));
}
