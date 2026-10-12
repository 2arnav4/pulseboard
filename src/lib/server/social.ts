import "server-only";
import { matchesQuery, paginate } from "@/lib/content";
import { MOCK_SOCIAL } from "@/lib/mock/social";
import type { Category } from "@/types/content";
import type { ProviderResult } from "./provider";

function newestFirst(a: { publishedAt: string }, b: { publishedAt: string }): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

/** Mock social API: posts filtered by category hashtags and an optional hashtag/handle. */
export function getSocialPosts(options: {
  categories: readonly Category[];
  page: number;
  pageSize: number;
  query?: string;
}): ProviderResult {
  const { categories, page, pageSize, query = "" } = options;
  const matching = MOCK_SOCIAL.filter(
    (post) => (categories.length === 0 || categories.includes(post.category)) && matchesQuery(post, query),
  ).sort(newestFirst);
  return { ...paginate(matching, page, pageSize), status: "mock" };
}

export function getTrendingPosts(pageSize: number): ProviderResult {
  const items = [...MOCK_SOCIAL].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, pageSize);
  return { items, hasMore: false, status: "mock" };
}
