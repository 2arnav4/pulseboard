"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { toggleFavorite } from "@/features/favorites/favoritesSlice";
import { itemOpened } from "@/features/history/historySlice";
import { formatRelativeTime } from "@/lib/format";
import { isOwnPost } from "@/lib/social";
import { postDeleted } from "@/features/social/socialSlice";
import { HashtagList } from "@/components/social/HashtagList";
import { ReactionBar } from "@/components/social/ReactionBar";
import { ShareButton } from "@/components/social/ShareButton";
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
  const ownPost = isOwnPost(item);
  const isRow = layout === "row";
  const meta = item.source === "movie" ? item.author : formatRelativeTime(item.publishedAt, i18n.language);
  // Social posts have no artwork; an empty placeholder would only add noise, so they render text-only.
  const showImage = item.imageUrl !== null || item.source !== "social";

  return (
    <motion.article
      data-testid="content-card"
      data-item-id={item.id}
      aria-labelledby={`title-${item.id}`}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={clsx(
        "group relative flex gap-4 rounded-3xl border border-border bg-surface p-3 transition-colors hover:border-muted/50 sm:gap-5",
        isRow ? "flex-col sm:flex-row" : "h-full flex-col",
      )}
    >
      {showImage && (
        <ContentImage
          src={item.imageUrl}
          source={item.source}
          sizes={isRow ? "(min-width: 640px) 208px, 100vw" : "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"}
          className={isRow ? "aspect-video w-full shrink-0 sm:aspect-auto sm:min-h-36 sm:w-52" : "aspect-video w-full"}
        />
      )}

      <div className={clsx("flex flex-1 flex-col gap-2 px-1 pb-1", isRow && "sm:py-1 sm:pr-2", !showImage && "pt-1 sm:pl-3")}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span className={clsx("text-[11px] font-medium uppercase tracking-[0.14em]", SOURCE_STYLES[item.source])}>
            {t(`card.source.${item.source}`)}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t(`categories.${item.category}`)}</span>
          {ownPost && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-text">{t("social.you")}</span>
            </>
          )}
          {meta && (
            <>
              <span aria-hidden="true">·</span>
              <span>{meta}</span>
            </>
          )}
          {isMock && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px]">{t("card.demo")}</span>}
        </div>

        <h3 id={`title-${item.id}`} className={clsx("line-clamp-2 font-display font-semibold leading-snug tracking-tight", isRow ? "text-xl" : "text-lg")}>
          {item.title}
        </h3>
        {item.description && <p className="line-clamp-2 text-sm leading-relaxed text-muted">{item.description}</p>}

        {item.hashtags && (ownPost || item.source === "social") && <HashtagList tags={item.hashtags} />}

        <div className="mt-auto flex flex-col gap-3 pt-3">
          <ReactionBar item={item} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {ownPost ? (
              <button
                type="button"
                onClick={() => dispatch(postDeleted(item.id))}
                aria-label={t("social.deleteLabel", { title: item.title })}
                className="inline-flex min-h-9 items-center text-sm font-medium text-danger underline decoration-danger/30 underline-offset-4 hover:decoration-danger"
              >
                {t("social.delete")}
              </button>
            ) : (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => dispatch(itemOpened(item))}
                className="group/cta inline-flex min-h-9 items-center gap-1 text-sm font-medium text-text underline decoration-border underline-offset-4 transition-colors hover:decoration-text"
              >
                {t(CTA_KEY[item.source])}
                <span aria-hidden="true" className="inline-block transition-transform group-hover/cta:translate-x-0.5">
                  →
                </span>
                <span className="sr-only"> {t("card.opensInNewTab")}</span>
              </a>
            )}

            {item.rating !== undefined && (
              <span className="num text-sm text-muted" aria-label={t("card.rating", { value: item.rating })}>
                {item.rating}
                <span className="text-xs"> / 10</span>
              </span>
            )}

            <div className="ml-auto flex items-center gap-1">
              {reorderControls}
              {!ownPost && <ShareButton item={item} />}
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => dispatch(toggleFavorite(item))}
                aria-pressed={isFavorite}
                aria-label={t(isFavorite ? "card.unfavorite" : "card.favorite", { title: item.title })}
                className={clsx(
                  "ml-1 inline-flex min-h-9 items-center rounded-full px-4 text-sm font-medium transition-colors",
                  isFavorite ? "bg-ink text-ink-contrast hover:bg-accent hover:text-accent-contrast" : "text-text ring-1 ring-inset ring-border hover:ring-text",
                )}
              >
                {t(isFavorite ? "card.saved" : "card.save")}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
