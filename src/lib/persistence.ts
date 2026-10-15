import { z } from "zod";
import { CATEGORIES, CONTENT_SOURCES, type ContentItem } from "@/types/content";
import { LANGUAGES, type PreferencesState } from "@/features/preferences/preferencesSlice";
import type { FavoritesState } from "@/features/favorites/favoritesSlice";
import type { HistoryState } from "@/features/history/historySlice";
import type { SocialState } from "@/features/social/socialSlice";
import { MAX_POSTS, MAX_REACTIONS_PER_ITEM } from "@/lib/social";

/** Bump when the stored shape changes; older blobs are then ignored instead of crashing the app. */
const STORAGE_VERSION = 1;
export const THEME_STORAGE_KEY = "pulseboard:theme";

export interface PersistedState {
  preferences?: PreferencesState;
  favorites?: FavoritesState;
  history?: HistoryState;
  feedOrder?: string[];
  social?: SocialState;
}

/** The exact placeholder pattern the old mock social and demo news data used. */
const LEGACY_PLACEHOLDER_URL = /^https:\/\/example\.com\/(social|news)\//;

const contentItemSchema: z.ZodType<ContentItem> = z.object({
  id: z.string(),
  source: z.enum(CONTENT_SOURCES),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().nullable(),
  // Mock items saved before 15 Oct 2026 carry example.com placeholder links; drop them on load.
  url: z.string().transform((url) => (LEGACY_PLACEHOLDER_URL.test(url) ? "" : url)),
  category: z.enum(CATEGORIES),
  publishedAt: z.string(),
  author: z.string().nullable(),
  rating: z.number().optional(),
  likes: z.number().optional(),
  hashtags: z.array(z.string()).optional(),
});

const persistedSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  preferences: z
    .object({
      categories: z.array(z.enum(CATEGORIES)).min(1),
      theme: z.enum(["light", "dark"]),
      language: z.enum(LANGUAGES),
      realtimeEnabled: z.boolean(),
    })
    .optional(),
  favorites: z.object({ items: z.array(contentItemSchema) }).optional(),
  history: z.object({ movieIds: z.array(z.number()) }).optional(),
  feedOrder: z.array(z.string()).optional(),
  // Added after v1 shipped; optional, so blobs saved before it still load.
  social: z
    .object({
      reactions: z.record(z.string(), z.array(z.string().max(32)).max(MAX_REACTIONS_PER_ITEM)),
      posts: z.array(contentItemSchema).max(MAX_POSTS),
    })
    .optional(),
});

/** One storage key per signed-in user, so two people sharing a browser keep separate dashboards. */
export function storageKeyFor(userId: string): string {
  return `pulseboard:v${STORAGE_VERSION}:${userId}`;
}

/** Returns null for missing, corrupted, or outdated data instead of throwing. */
export function loadPersistedState(storage: Storage, key: string): PersistedState | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const result = persistedSchema.safeParse(JSON.parse(raw));
    if (!result.success) return null;
    const { version: _version, ...state } = result.data;
    return state;
  } catch {
    return null;
  }
}

export function savePersistedState(storage: Storage, key: string, state: PersistedState): void {
  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, ...state }));
    if (state.preferences) storage.setItem(THEME_STORAGE_KEY, state.preferences.theme);
  } catch {
    // Quota exceeded or storage disabled (private mode): the app keeps working in memory.
  }
}
