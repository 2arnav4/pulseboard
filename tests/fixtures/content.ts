import type { ContentItem, ContentPage } from "@/types/content";

export function makeItem(overrides: Partial<ContentItem> & Pick<ContentItem, "id">): ContentItem {
  return {
    source: "news",
    title: `Title ${overrides.id}`,
    description: `Description ${overrides.id}`,
    imageUrl: null,
    url: `https://example.com/${overrides.id}`,
    category: "technology",
    publishedAt: "2026-10-12T10:00:00.000Z",
    author: "Pulse Wire",
    ...overrides,
  };
}

export function makePage(items: ContentItem[], overrides: Partial<ContentPage> = {}): ContentPage {
  return { items, page: 1, hasMore: false, sources: { news: "live", movie: "live", social: "mock" }, ...overrides };
}

export const newsItem = makeItem({ id: "news-1", title: "Chip shortage eases" });
export const movieItem = makeItem({ id: "movie-550", source: "movie", title: "Fight Club", rating: 8.4, author: "1999" });
export const socialItem = makeItem({
  id: "social-tech-1",
  source: "social",
  title: "@devdiaries: Shipped dark mode",
  // Mock social posts have no page elsewhere, like the real mock API.
  url: "",
  hashtags: ["#webdev"],
  likes: 1200,
});
