"use client";

import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ContentPage, ContentSource } from "@/types/content";

/**
 * Tells the user when news or movies are served from bundled demo data (no API key,
 * quota exhausted, upstream error). The social feed is a mock API by design, so it is not flagged.
 */
export function DemoNotice({ sources }: { sources: ContentPage["sources"] | undefined }) {
  const { t } = useTranslation();
  const demoSources = (["news", "movie"] as ContentSource[]).filter((source) => sources?.[source] === "mock");
  if (demoSources.length === 0) return null;
  const names = demoSources.map((source) => t(`card.source.${source}`)).join(", ");
  return (
    <p className="flex items-start gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {t("state.demoNotice", { sources: names })}
    </p>
  );
}
