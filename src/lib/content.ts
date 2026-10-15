import type { ContentItem } from "@/types/content";

/** Merge several lists by taking one item from each in turn: [a1, b1, c1, a2, b2, ...]. */
export function interleave<T>(lists: readonly (readonly T[])[]): T[] {
  const result: T[] = [];
  const longest = Math.max(0, ...lists.map((list) => list.length));
  for (let index = 0; index < longest; index++) {
    for (const list of lists) {
      if (index < list.length) result.push(list[index]);
    }
  }
  return result;
}

export interface Paginated<T> {
  items: T[];
  hasMore: boolean;
}

/** 1-based page slicing for in-memory data. */
export function paginate<T>(items: readonly T[], page: number, pageSize: number): Paginated<T> {
  const start = (Math.max(1, page) - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), hasMore: start + pageSize < items.length };
}

/**
 * Case-insensitive match against title, description, author and hashtags, at the start of a
 * word: "ai" finds "AI tools" and "#ai" but not "Training". Prefixes still work ("foot" → "football").
 */
export function matchesQuery(item: ContentItem, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [item.title, item.description, item.author ?? "", ...(item.hashtags ?? [])]
    .join(" ")
    .toLowerCase();
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])${escaped}`, "u").test(haystack);
}

/** Drop later duplicates by id, keeping the first occurrence's position. */
export function uniqueById(items: readonly ContentItem[]): ContentItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * Apply the user's drag-and-drop order to a fresh list of items.
 * Items the user has ordered come first in their saved order; new items keep API order after them.
 */
export function applyCustomOrder(items: readonly ContentItem[], order: readonly string[]): ContentItem[] {
  if (order.length === 0) return [...items];
  const rank = new Map(order.map((id, index) => [id, index]));
  const ranked = items.filter((item) => rank.has(item.id));
  const unranked = items.filter((item) => !rank.has(item.id));
  ranked.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
  return [...ranked, ...unranked];
}

/** Stable short hash (djb2) used to build ids from article URLs. */
export function hashString(value: string): string {
  let hash = 5381;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}
