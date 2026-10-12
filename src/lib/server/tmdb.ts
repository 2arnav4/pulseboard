import "server-only";
import { matchesQuery, paginate } from "@/lib/content";
import { MOCK_MOVIES } from "@/lib/mock/movies";
import type { Category, ContentItem } from "@/types/content";
import { fetchJson, serverEnv } from "./env";
import { withFallback, type ProviderResult } from "./provider";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const REVALIDATE_SECONDS = 3600;
/** TMDB caps paging at 500 pages. */
const MAX_PAGE = 500;

/**
 * TMDB has movie genres, not news categories. This is an approximate mapping
 * from each dashboard category to the closest TMDB genre ids.
 */
export const CATEGORY_GENRES: Record<Category, number[]> = {
  technology: [878],
  science: [99, 878],
  business: [18, 80],
  sports: [28],
  health: [99, 10751],
  entertainment: [35, 10402],
  general: [12],
};

interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  vote_average: number;
  genre_ids: number[];
}

interface TmdbListResponse {
  page: number;
  total_pages: number;
  results: TmdbMovie[];
}

export function categoryForGenres(genreIds: readonly number[], fallback: Category): Category {
  for (const genreId of genreIds) {
    const match = (Object.entries(CATEGORY_GENRES) as [Category, number[]][]).find(([, ids]) => ids.includes(genreId));
    if (match) return match[0];
  }
  return fallback;
}

export function normalizeMovie(movie: TmdbMovie, fallbackCategory: Category): ContentItem {
  return {
    id: `movie-${movie.id}`,
    source: "movie",
    title: movie.title,
    description: movie.overview,
    imageUrl: movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : null,
    url: `https://www.themoviedb.org/movie/${movie.id}`,
    category: categoryForGenres(movie.genre_ids, fallbackCategory),
    publishedAt: movie.release_date ? new Date(movie.release_date).toISOString() : new Date(0).toISOString(),
    author: movie.release_date ? movie.release_date.slice(0, 4) : null,
    rating: Math.round(movie.vote_average * 10) / 10,
  };
}

/** Accept either a v4 read-access token (a JWT, sent as Bearer) or a v3 api_key. */
function authFor(apiKey: string): { headers: Record<string, string>; param: Record<string, string> } {
  return apiKey.startsWith("eyJ")
    ? { headers: { Authorization: `Bearer ${apiKey}` }, param: {} }
    : { headers: {}, param: { api_key: apiKey } };
}

function apiKeyOrNull(): string | null {
  if (serverEnv.forceMocks) return null;
  return serverEnv.tmdbApiKey ?? null;
}

async function requestMovies(path: string, params: Record<string, string>, page: number, pageSize: number, fallbackCategory: Category) {
  const apiKey = apiKeyOrNull();
  if (!apiKey) throw new Error("TMDB_API_KEY not configured");
  const auth = authFor(apiKey);
  const query = new URLSearchParams({ ...params, ...auth.param, page: String(Math.min(page, MAX_PAGE)) });
  const data = await fetchJson<TmdbListResponse>(`${BASE_URL}/${path}?${query}`, {
    headers: auth.headers,
    revalidateSeconds: REVALIDATE_SECONDS,
  });
  return {
    // TMDB pages are fixed at 20; trim to keep the unified feed balanced.
    items: data.results.slice(0, pageSize).map((movie) => normalizeMovie(movie, fallbackCategory)),
    hasMore: data.page < Math.min(data.total_pages, MAX_PAGE),
  };
}

function mockForCategories(categories: readonly Category[]): ContentItem[] {
  const matching = MOCK_MOVIES.filter((movie) => categories.includes(movie.category));
  return matching.length > 0 ? matching : [...MOCK_MOVIES];
}

/**
 * Personalized recommendations. With a seed movie (the user's latest favorited
 * movie) TMDB's per-movie recommendations are used; otherwise discover by the
 * genres mapped from the user's preferred categories.
 */
export function getRecommendations(
  categories: readonly Category[],
  page: number,
  pageSize: number,
  seedMovieId?: number,
): Promise<ProviderResult> {
  const fallbackCategory = categories[0] ?? "entertainment";
  const genres = [...new Set(categories.flatMap((category) => CATEGORY_GENRES[category]))];
  const live = apiKeyOrNull()
    ? () =>
        seedMovieId
          ? requestMovies(`movie/${seedMovieId}/recommendations`, {}, page, pageSize, fallbackCategory)
          : requestMovies(
              "discover/movie",
              { sort_by: "popularity.desc", with_genres: genres.join("|"), include_adult: "false" },
              page,
              pageSize,
              fallbackCategory,
            )
    : null;
  return withFallback("tmdb", live, () => paginate(mockForCategories(categories), page, pageSize));
}

export function searchMovies(query: string, page: number, pageSize: number): Promise<ProviderResult> {
  return withFallback(
    "tmdb",
    apiKeyOrNull() ? () => requestMovies("search/movie", { query, include_adult: "false" }, page, pageSize, "entertainment") : null,
    () => paginate(MOCK_MOVIES.filter((movie) => matchesQuery(movie, query)), page, pageSize),
  );
}

export function getTrendingMovies(pageSize: number): Promise<ProviderResult> {
  return withFallback(
    "tmdb",
    apiKeyOrNull() ? () => requestMovies("trending/movie/week", {}, 1, pageSize, "entertainment") : null,
    () => ({ items: [...MOCK_MOVIES].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, pageSize), hasMore: false }),
  );
}
