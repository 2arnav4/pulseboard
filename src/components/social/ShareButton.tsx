"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ContentItem } from "@/types/content";

type Feedback = "linkCopied" | "textCopied" | "failed" | null;

const FEEDBACK_KEY = { linkCopied: "social.linkCopied", textCopied: "social.textCopied", failed: "social.shareFailed" } as const;

/**
 * Native share sheet where the browser has one (mobile), otherwise copies the link.
 * Items with no page of their own (mock social posts) share their text instead.
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
    const payload = item.url ? { title: item.title, url: item.url } : { text: shareText(item) };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        // The user closed the share sheet: not an error worth showing.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(item.url || shareText(item));
      setFeedback(item.url ? "linkCopied" : "textCopied");
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
          <span className="rounded-full bg-ink px-2.5 py-1 text-ink-contrast">{t(FEEDBACK_KEY[feedback])}</span>
        )}
      </span>
    </span>
  );
}

function shareText(item: ContentItem): string {
  const tags = item.hashtags ?? [];
  // Mock titles already hold the post text; append tags only if the text doesn't contain them.
  const missing = tags.filter((tag) => !item.title.toLowerCase().includes(tag));
  return [item.title, ...missing].join(" ");
}
