import type { ContentItem, SourceStatus } from "@/types/content";

/** What every source adapter (news, movies, social) returns to the aggregator. */
export interface ProviderResult {
  items: ContentItem[];
  hasMore: boolean;
  status: SourceStatus;
}

/**
 * Run the live call; on any failure, log it and serve demo data instead so the
 * dashboard keeps working (quota exhausted, missing key, network error).
 */
export async function withFallback(
  label: string,
  live: (() => Promise<Omit<ProviderResult, "status">>) | null,
  fallback: () => Omit<ProviderResult, "status">,
): Promise<ProviderResult> {
  if (!live) return { ...fallback(), status: "mock" };
  try {
    return { ...(await live()), status: "live" };
  } catch (error) {
    console.warn(`[${label}] live request failed, serving demo data:`, error instanceof Error ? error.message : error);
    return { ...fallback(), status: "mock" };
  }
}
