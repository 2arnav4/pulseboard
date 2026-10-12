import "server-only";
import { hashString, matchesQuery, paginate } from "@/lib/content";
import { MOCK_NEWS } from "@/lib/mock/news";
import type { Category, ContentItem } from "@/types/content";
import { fetchJson, serverEnv } from "./env";
import { withFallback, type ProviderResult } from "./provider";

const BASE_URL = "https://newsapi.org/v2";
/** Free plan allows 100 requests/day, so identical requests are cached for 15 minutes. */
const REVALIDATE_SECONDS = 900;
/** NewsAPI's Developer plan never returns more than 100 results per query. */
const MAX_RESULTS = 100;

interface NewsApiArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string | null;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
}

interface NewsApiResponse {
  status: "ok";
  totalResults: number;
  articles: NewsApiArticle[];
}

export function normalizeArticle(article: NewsApiArticle, category: Category): ContentItem | null {
  // NewsAPI blanks out takedowns as "[Removed]"; skip them and anything without a title.
  if (!article.title || article.title === "[Removed]") return null;
  return {
    id: `news-${hashString(article.url)}`,
    source: "news",
    title: article.title,
    description: article.description ?? "",
    imageUrl: article.urlToImage,
    url: article.url,
    category,
    publishedAt: article.publishedAt,
    author: article.source.name || article.author,
  };
}

function apiKeyOrNull(): string | null {
  if (serverEnv.forceMocks) return null;
  return serverEnv.newsApiKey ?? null;
}

async function requestNews(path: string, params: Record<string, string>, category: Category, page: number, pageSize: number) {
  const apiKey = apiKeyOrNull();
  if (!apiKey) throw new Error("NEWS_API_KEY not configured");
  const query = new URLSearchParams({ ...params, page: String(page), pageSize: String(pageSize) });
  const data = await fetchJson<NewsApiResponse>(`${BASE_URL}/${path}?${query}`, {
    headers: { "X-Api-Key": apiKey },
    revalidateSeconds: REVALIDATE_SECONDS,
  });
  const items = data.articles.map((article) => normalizeArticle(article, category)).filter((item) => item !== null);
  const reachable = Math.min(data.totalResults, MAX_RESULTS);
  return { items, hasMore: page * pageSize < reachable };
}

/** Top headlines for one category. */
export function getNewsByCategory(category: Category, page: number, pageSize: number): Promise<ProviderResult> {
  return withFallback(
    "news",
    apiKeyOrNull() ? () => requestNews("top-headlines", { category, country: "us" }, category, page, pageSize) : null,
    () => paginate(MOCK_NEWS.filter((item) => item.category === category), page, pageSize),
  );
}

/** Full-text search across all articles. */
export function searchNews(query: string, page: number, pageSize: number): Promise<ProviderResult> {
  return withFallback(
    "news",
    apiKeyOrNull()
      ? () => requestNews("everything", { q: query, sortBy: "publishedAt", language: "en" }, "general", page, pageSize)
      : null,
    () => paginate(MOCK_NEWS.filter((item) => matchesQuery(item, query)), page, pageSize),
  );
}

/** Today's top headlines, regardless of category. */
export function getTrendingNews(pageSize: number): Promise<ProviderResult> {
  return withFallback(
    "news",
    apiKeyOrNull() ? () => requestNews("top-headlines", { country: "us" }, "general", 1, pageSize) : null,
    () => ({ items: MOCK_NEWS.filter((_, index) => index % 6 === 0).slice(0, pageSize), hasMore: false }),
  );
}
