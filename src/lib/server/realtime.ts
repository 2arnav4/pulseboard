import "server-only";
import { buildLivePost } from "@/lib/mock/social";
import type { Category, ContentItem } from "@/types/content";

let sequence = 0;

/** A freshly "published" social post for one of the user's categories. */
export function nextLivePost(categories: readonly Category[], now = new Date()): ContentItem {
  sequence += 1;
  const category = categories[sequence % categories.length];
  return buildLivePost(category, sequence, now.toISOString());
}

/** Serialize one Server-Sent Event frame. */
export function sseFrame(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
