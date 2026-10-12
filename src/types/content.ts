export const CATEGORIES = [
  "technology",
  "business",
  "sports",
  "science",
  "health",
  "entertainment",
  "general",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONTENT_SOURCES = ["news", "movie", "social"] as const;

export type ContentSource = (typeof CONTENT_SOURCES)[number];

/** One normalized shape for every card, whatever API it came from. */
export interface ContentItem {
  id: string;
  source: ContentSource;
  title: string;
  description: string;
  imageUrl: string | null;
  url: string;
  category: Category;
  publishedAt: string;
  author: string | null;
  /** Source-specific numbers: TMDB rating, social likes. */
  rating?: number;
  likes?: number;
  hashtags?: string[];
}

export type SourceStatus = "live" | "mock" | "error";

/** Every list endpoint returns this envelope. */
export interface ContentPage {
  items: ContentItem[];
  page: number;
  hasMore: boolean;
  sources: Partial<Record<ContentSource, SourceStatus>>;
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function isContentSource(value: string): value is ContentSource {
  return (CONTENT_SOURCES as readonly string[]).includes(value);
}
