import type { ContentItem } from "@/types/content";
import { hashString } from "./content";

/** The one-tap reaction row, the same six most social apps settled on. */
export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"] as const;
export const MAX_REACTIONS_PER_ITEM = 8;
export const POST_MAX_LENGTH = 280;
export const MAX_POSTS = 50;
/** Posts written by the user get this id prefix; the UI uses it to offer "Delete" instead of "View post". */
export const OWN_POST_PREFIX = "post-";

export interface ReactionCount {
  emoji: string;
  count: number;
  mine: boolean;
}

export function isOwnPost(item: Pick<ContentItem, "id">): boolean {
  return item.id.startsWith(OWN_POST_PREFIX);
}

/**
 * "#AI and #ml" → ["#ai", "#ml"]; unique and lowercase. \p{M} keeps combining marks, so Hindi
 * tags like "#क्रिकेट" stay whole; the lookbehind skips "#" in the middle of a word ("no#tag").
 */
export function extractHashtags(text: string): string[] {
  const tags = text.match(/(?<![\p{L}\p{M}\p{N}_])#[\p{L}\p{M}\p{N}_]+/gu) ?? [];
  return [...new Set(tags.map((tag) => tag.toLowerCase()))];
}

/**
 * Starting counts for the mock social feed: the post's likes split over up to three
 * emojis picked from its id. Deterministic, so a card shows the same counts on every render.
 * News and movies have no audience data, so they start empty.
 */
export function baseReactions(item: Pick<ContentItem, "id" | "likes">): Record<string, number> {
  if (!item.likes) return {};
  const hash = Number.parseInt(hashString(item.id), 36);
  const shares = [0.6, 0.3, 0.1];
  const counts: Record<string, number> = {};
  shares.forEach((share, index) => {
    const emoji = QUICK_REACTIONS[(hash + index * 2) % QUICK_REACTIONS.length];
    const count = Math.round((item.likes ?? 0) * share);
    if (count > 0) counts[emoji] = (counts[emoji] ?? 0) + count;
  });
  return counts;
}

/** Base counts plus the user's own reactions, highest first; the user's picks win ties. */
export function combineReactions(base: Record<string, number>, mine: readonly string[]): ReactionCount[] {
  const emojis = new Set([...Object.keys(base), ...mine]);
  return [...emojis]
    .map((emoji) => {
      const isMine = mine.includes(emoji);
      return { emoji, count: (base[emoji] ?? 0) + (isMine ? 1 : 0), mine: isMine };
    })
    .sort((a, b) => b.count - a.count || Number(b.mine) - Number(a.mine));
}
