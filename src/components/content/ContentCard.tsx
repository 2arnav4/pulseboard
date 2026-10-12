"use client";

import { ExternalLink, Heart, Play, Star, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { toggleFavorite } from "@/features/favorites/favoritesSlice";
import { itemOpened } from "@/features/history/historySlice";
import { formatCompactNumber, formatRelativeTime } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { ContentItem, ContentSource } from "@/types/content";
import { ContentImage } from "./ContentImage";

const SOURCE_STYLES: Record<ContentSource, string> = {
  news: "text-news",
  movie: "text-movie",
  social: "text-social",
};

const CTA_KEY = { news: "card.readMore", movie: "card.playNow", social: "card.viewPost" } as const;

interface ContentCardProps {
  item: ContentItem;
  layout?: "grid" | "row";
  /** Drag handle and keyboard move buttons, supplied by the sortable feed. */
  reorderControls?: ReactNode;
}

export function ContentCard({ item, layout = "grid", reorderControls }: ContentCardProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const isFavorite = useAppSelector((state) => state.favorites.items.some((favorite) => favorite.id === item.id));
  const isMock = item.id.includes("-mock-");
  const isRow = layout === "row";
  const CtaIcon = item.source === "movie" ? Play : ExternalLink;
  const meta = item.source === "movie" ? item.author : formatRelativeTime(item.publishedAt, i18n.language);

  return (
    <motion.article
      data-testid="content-card"
      data-item-id={item.id}
      aria-labelledby={`title-${item.id}`}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={clsx(
        "group relative flex overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-lg",
        isRow ? "flex-col sm:flex-row" : "h-full flex-col",
      )}
    >
      <ContentImage
        src={item.imageUrl}
        source={item.source}
        sizes={isRow ? "(min-width: 640px) 192px, 100vw" : "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"}
        className={isRow ? "aspect-video w-full shrink-0 sm:aspect-auto sm:w-48" : "aspect-video w-full"}
      />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
          <span className={clsx("uppercase tracking-wide", SOURCE_STYLES[item.source])}>{t(`card.source.${item.source}`)}</span>
          <span aria-hidden="true" className="text-muted">·</span>
          <span className="text-muted">{t(`categories.${item.category}`)}</span>
          {meta && (
            <>
              <span aria-hidden="true" className="text-muted">·</span>
              <span className="text-muted">{meta}</span>
            </>
          )}
          {isMock && (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">{t("card.demo")}</span>
          )}
        </div>

        <h3 id={`title-${item.id}`} className="line-clamp-2 text-base font-semibold leading-snug">
          {item.title}
        </h3>
        {item.description && <p className="line-clamp-3 text-sm text-muted">{item.description}</p>}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => dispatch(itemOpened(item))}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
          >
            <CtaIcon aria-hidden="true" className="size-4" />
            {t(CTA_KEY[item.source])}
            <span className="sr-only"> {t("card.opensInNewTab")}</span>
          </a>

          {item.rating !== undefined && (
            <span className="inline-flex items-center gap-1 text-sm text-muted" aria-label={t("card.rating", { value: item.rating })}>
              <Star aria-hidden="true" className="size-4 fill-current text-movie" />
              {item.rating}
            </span>
          )}
          {item.likes !== undefined && (
            <span className="inline-flex items-center gap-1 text-sm text-muted" aria-label={t("card.likes", { count: item.likes })}>
              <ThumbsUp aria-hidden="true" className="size-4" />
              {formatCompactNumber(item.likes, i18n.language)}
            </span>
          )}

          <div className="ml-auto flex items-center gap-1">
            {reorderControls}
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => dispatch(toggleFavorite(item))}
              aria-pressed={isFavorite}
              aria-label={t(isFavorite ? "card.unfavorite" : "card.favorite", { title: item.title })}
              className="inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-danger"
            >
              <Heart aria-hidden="true" className={clsx("size-5", isFavorite && "fill-current text-danger")} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
