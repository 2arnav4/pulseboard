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
  const url = `/api/realtime?categories=${encodeURIComponent(categories.join(","))}`;
  const active = hydrated && enabled;
  // The URL whose stream is currently open; status is derived from it, so no setState runs in the effect body.
  const [connectedUrl, setConnectedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!active || typeof EventSource === "undefined") return;
    const source = new EventSource(url);
    source.addEventListener("ready", () => setConnectedUrl(url));
    source.addEventListener("post", (event) => {
      try {
        dispatch(liveItemReceived(JSON.parse((event as MessageEvent<string>).data) as ContentItem));
      } catch {
        // Ignore a malformed frame rather than breaking the stream.
      }
    });
    source.onerror = () => setConnectedUrl(null);
    return () => source.close();
  }, [dispatch, active, url]);

  if (!active) return "off";
  return connectedUrl === url ? "live" : "connecting";
}
