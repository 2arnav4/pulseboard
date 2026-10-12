import "server-only";
import { interleave, uniqueById } from "@/lib/content";
import type { Category, ContentPage, ContentSource } from "@/types/content";
import { getNewsByCategory, getTrendingNews, searchNews } from "./news";
import type { ProviderResult } from "./provider";
import { getSocialPosts, getTrendingPosts } from "./social";
import { getRecommendations, getTrendingMovies, searchMovies } from "./tmdb";

export const FEED_PAGE_SIZE = { news: 6, movie: 4, social: 4 } as const;
const SEARCH_PAGE_SIZE = 8;
const TRENDING_SIZE = 12;

function toPage(page: number, results: Partial<Record<ContentSource, ProviderResult>>): ContentPage {
  const entries = Object.entries(results) as [ContentSource, ProviderResult][];
  return {
    items: uniqueById(interleave(entries.map(([, result]) => result.items))),
    page,
    hasMore: entries.some(([, result]) => result.hasMore),
    sources: Object.fromEntries(entries.map(([source, result]) => [source, result.status])),
  };
}

/**
 * One page of the unified feed. News rotates through the preferred categories page by
 * page so each page costs a single NewsAPI request (the free plan allows 100/day).
 */
export async function getFeedPage(options: { categories: Category[]; page: number; seedMovieId?: number }): Promise<ContentPage> {
  const { categories, page, seedMovieId } = options;
  const newsCategory = categories[(page - 1) % categories.length];
  const newsPage = Math.floor((page - 1) / categories.length) + 1;

  const [news, movie] = await Promise.all([
    getNewsByCategory(newsCategory, newsPage, FEED_PAGE_SIZE.news),
    getRecommendations(categories, page, FEED_PAGE_SIZE.movie, seedMovieId),
  ]);
  const social = getSocialPosts({ categories, page, pageSize: FEED_PAGE_SIZE.social });

  return toPage(page, { news, movie, social });
}

export type SearchScope = ContentSource | "all";

export async function searchContent(options: { query: string; scope: SearchScope; page: number }): Promise<ContentPage> {
  const { query, scope, page } = options;
  const wants = (source: ContentSource) => scope === "all" || scope === source;

  const [news, movie] = await Promise.all([
    wants("news") ? searchNews(query, page, SEARCH_PAGE_SIZE) : undefined,
    wants("movie") ? searchMovies(query, page, SEARCH_PAGE_SIZE) : undefined,
  ]);
  const social = wants("social") ? getSocialPosts({ categories: [], page, pageSize: SEARCH_PAGE_SIZE, query }) : undefined;

  return toPage(page, { ...(news && { news }), ...(movie && { movie }), ...(social && { social }) });
}

export async function getTrending(source: ContentSource): Promise<ContentPage> {
  const result =
    source === "news"
      ? await getTrendingNews(TRENDING_SIZE)
      : source === "movie"
        ? await getTrendingMovies(TRENDING_SIZE)
        : getTrendingPosts(TRENDING_SIZE);
  return toPage(1, { [source]: result });
}
