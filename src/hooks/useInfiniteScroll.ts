"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `onReachEnd` when the returned sentinel element scrolls within `rootMargin`
 * of the viewport. Disabled while `enabled` is false (already loading, or no more pages).
 */
export function useInfiniteScroll<T extends Element>(onReachEnd: () => void, enabled: boolean, rootMargin = "600px") {
  const sentinelRef = useRef<T | null>(null);
  const callbackRef = useRef(onReachEnd);

  useEffect(() => {
    callbackRef.current = onReachEnd;
  }, [onReachEnd]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) callbackRef.current();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return sentinelRef;
}
