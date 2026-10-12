"use client";

import { useEffect, useState } from "react";
import { liveItemReceived } from "@/features/feed/feedSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { ContentItem } from "@/types/content";

export type RealtimeStatus = "off" | "connecting" | "live";

/**
 * Subscribes to /api/realtime (Server-Sent Events) while real-time updates are enabled.
 * EventSource reconnects by itself when the server closes the stream.
 */
export function useRealtimeFeed(): RealtimeStatus {
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((state) => state.app.hydrated);
  const enabled = useAppSelector((state) => state.preferences.realtimeEnabled);
  const categories = useAppSelector((state) => state.preferences.categories);
  const [status, setStatus] = useState<RealtimeStatus>("off");
  const categoryKey = categories.join(",");

  useEffect(() => {
    if (!hydrated || !enabled || typeof EventSource === "undefined") {
      setStatus("off");
      return;
    }
    setStatus("connecting");
    const source = new EventSource(`/api/realtime?categories=${encodeURIComponent(categoryKey)}`);
    source.addEventListener("ready", () => setStatus("live"));
    source.addEventListener("post", (event) => {
      try {
        dispatch(liveItemReceived(JSON.parse((event as MessageEvent<string>).data) as ContentItem));
      } catch {
        // Ignore a malformed frame rather than breaking the stream.
      }
    });
    source.onerror = () => setStatus("connecting");
    return () => source.close();
  }, [dispatch, hydrated, enabled, categoryKey]);

  return status;
}
