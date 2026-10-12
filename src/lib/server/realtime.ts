import "server-only";
import { buildSocialPost, SOCIAL_POST_COUNT_PER_CATEGORY } from "@/lib/mock/social";
import type { Category, ContentItem } from "@/types/content";

let sequence = 0;

/** A freshly "published" social post for one of the user's categories. */
export function nextLivePost(categories: readonly Category[], now = new Date()): ContentItem {
  sequence += 1;
  const category = categories[sequence % categories.length];
  const template = buildSocialPost(category, sequence % SOCIAL_POST_COUNT_PER_CATEGORY, now.toISOString());
  return { ...template, id: `social-live-${now.getTime()}-${sequence}`, likes: 0 };
}

/** Serialize one Server-Sent Event frame. */
export function sseFrame(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
