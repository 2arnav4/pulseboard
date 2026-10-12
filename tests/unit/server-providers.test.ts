import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getFeedPage, getTrending, searchContent } from "@/lib/server/content-service";
import { getNewsByCategory, normalizeArticle } from "@/lib/server/news";
import { categoryForGenres, getRecommendations, normalizeMovie } from "@/lib/server/tmdb";
import { feedQuerySchema, searchQuerySchema } from "@/lib/server/validation";
import { server } from "../msw/server";

const article = {
  source: { id: null, name: "The Verge" },
  author: "Jane Doe",
  title: "New chip announced",
  description: "Faster and cooler.",
  url: "https://example.com/chip",
  urlToImage: "https://example.com/chip.jpg",
  publishedAt: "2026-10-12T09:00:00Z",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("NewsAPI adapter", () => {
  it("normalizes an article and skips removed ones", () => {
    const item = normalizeArticle(article, "technology");
    expect(item).toMatchObject({ source: "news", title: "New chip announced", author: "The Verge", category: "technology" });
    expect(item?.id).toMatch(/^news-/);
    expect(normalizeArticle({ ...article, title: "[Removed]" }, "technology")).toBeNull();
  });

  it("returns live data and computes hasMore from totalResults", async () => {
    vi.stubEnv("NEWS_API_KEY", "test-key");
    server.use(
      http.get("https://newsapi.org/v2/top-headlines", ({ request }) => {
        expect(request.headers.get("x-api-key")).toBe("test-key");
        return HttpResponse.json({ status: "ok", totalResults: 12, articles: [article] });
      }),
    );
    const result = await getNewsByCategory("technology", 1, 6);
    expect(result.status).toBe("live");
    expect(result.hasMore).toBe(true);
    expect(result.items[0].title).toBe("New chip announced");
  });

  it("falls back to demo data when the daily quota is exhausted", async () => {
    vi.stubEnv("NEWS_API_KEY", "test-key");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    server.use(
      http.get("https://newsapi.org/v2/top-headlines", () =>
        HttpResponse.json({ status: "error", code: "rateLimited" }, { status: 429 }),
      ),
    );
    const result = await getNewsByCategory("sports", 1, 6);
    expect(result.status).toBe("mock");
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((item) => item.category === "sports")).toBe(true);
  });

  it("uses demo data without calling the API when no key is set", async () => {
    vi.stubEnv("NEWS_API_KEY", "");
    const result = await getNewsByCategory("health", 1, 6);
    expect(result.status).toBe("mock");
  });
});

describe("TMDB adapter", () => {
  const movie = { id: 550, title: "Fight Club", overview: "...", poster_path: "/p.jpg", release_date: "1999-10-15", vote_average: 8.433, genre_ids: [18] };

  it("normalizes a movie with poster URL, year and rounded rating", () => {
    expect(normalizeMovie(movie, "sports")).toMatchObject({
      id: "movie-550",
      imageUrl: "https://image.tmdb.org/t/p/w500/p.jpg",
      author: "1999",
      rating: 8.4,
      category: "business",
    });
  });

  it("maps genres back to a category with a fallback", () => {
    expect(categoryForGenres([878], "general")).toBe("technology");
    expect(categoryForGenres([999999], "general")).toBe("general");
  });

  it("sends a v4 token as a Bearer header and uses the seed for recommendations", async () => {
    vi.stubEnv("TMDB_API_KEY", "eyJtoken");
    server.use(
      http.get("https://api.themoviedb.org/3/movie/550/recommendations", ({ request }) => {
        expect(request.headers.get("authorization")).toBe("Bearer eyJtoken");
        return HttpResponse.json({ page: 1, total_pages: 3, results: [movie] });
      }),
    );
    const result = await getRecommendations(["technology"], 1, 4, 550);
    expect(result).toMatchObject({ status: "live", hasMore: true });
  });

  it("sends a v3 key as a query parameter", async () => {
    vi.stubEnv("TMDB_API_KEY", "v3key");
    server.use(
      http.get("https://api.themoviedb.org/3/discover/movie", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("api_key")).toBe("v3key");
        expect(url.searchParams.get("with_genres")).toBe("878");
        return HttpResponse.json({ page: 1, total_pages: 1, results: [] });
      }),
    );
    const result = await getRecommendations(["technology"], 1, 4);
    expect(result).toMatchObject({ status: "live", hasMore: false, items: [] });
  });
});

describe("content service", () => {
  it("builds a feed page from all three sources and reports their status", async () => {
    vi.stubEnv("MOCK_APIS", "1");
    const page = await getFeedPage({ categories: ["technology", "sports"], page: 1 });
    expect(new Set(page.items.map((item) => item.source))).toEqual(new Set(["news", "movie", "social"]));
    expect(page.sources).toEqual({ news: "mock", movie: "mock", social: "mock" });
    expect(page.items[0].source).toBe("news");
    expect(page.items[1].source).toBe("movie");
  });

  it("limits search to the requested scope", async () => {
    vi.stubEnv("MOCK_APIS", "1");
    const page = await searchContent({ query: "#cricket", scope: "social", page: 1 });
    expect(Object.keys(page.sources)).toEqual(["social"]);
    expect(page.items.every((item) => item.source === "social")).toBe(true);
  });

  it("returns trending posts sorted by likes", async () => {
    const page = await getTrending("social");
    const likes = page.items.map((item) => item.likes ?? 0);
    expect(likes).toEqual([...likes].sort((a, b) => b - a));
  });
});

describe("request validation", () => {
  it("drops unknown categories and falls back to defaults", () => {
    expect(feedQuerySchema.parse({ categories: "sports,cooking,sports" }).categories).toEqual(["sports"]);
    expect(feedQuerySchema.parse({}).categories).toEqual(["technology", "business", "sports"]);
  });

  it("rejects too-short queries, unknown scopes and out-of-range pages", () => {
    expect(searchQuerySchema.safeParse({ q: "a" }).success).toBe(false);
    expect(searchQuerySchema.safeParse({ q: "mars", type: "podcasts" }).success).toBe(false);
    expect(feedQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(feedQuerySchema.safeParse({ page: "abc" }).success).toBe(false);
  });
});
