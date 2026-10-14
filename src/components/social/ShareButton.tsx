"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ContentItem } from "@/types/content";

type Feedback = "copied" | "failed" | null;

/**
 * Native share sheet where the browser has one (mobile), otherwise copies the link.
 * The result is announced through a status region.
 */
export function ShareButton({ item }: { item: ContentItem }) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: item.title, url: item.url });
        return;
      } catch (error) {
        // The user closed the share sheet: not an error worth showing.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(item.url);
      setFeedback("copied");
    } catch {
      setFeedback("failed");
    }
  };

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => void share()}
        aria-label={t("social.shareLabel", { title: item.title })}
        className="inline-flex min-h-9 items-center rounded-full px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text"
      >
        {t("social.share")}
      </button>
      <span role="status" className="pointer-events-none absolute -top-7 right-0 whitespace-nowrap text-xs">
        {feedback && (
          <span className="rounded-full bg-ink px-2.5 py-1 text-ink-contrast">{t(feedback === "copied" ? "social.linkCopied" : "social.shareFailed")}</span>
        )}
      </span>
    </span>
  );
}
