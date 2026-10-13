"use client";

import { motion } from "framer-motion";
import { useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { ContentGrid } from "@/components/content/ContentGrid";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Spinner } from "@/components/ui/Spinner";
import { useGetTrendingQuery } from "@/features/api/contentApi";
import { CONTENT_SOURCES, type ContentSource } from "@/types/content";

/** Trending news, movies and posts in an accessible tab set (arrow keys move between tabs). */
export function TrendingView() {
  const { t } = useTranslation();
  const [active, setActive] = useState<ContentSource>("news");
  const tabRefs = useRef<Record<ContentSource, HTMLButtonElement | null>>({ news: null, movie: null, social: null });
  const { data, isLoading, isFetching, isError, refetch } = useGetTrendingQuery(active);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = CONTENT_SOURCES.indexOf(active);
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = CONTENT_SOURCES[(index + delta + CONTENT_SOURCES.length) % CONTENT_SOURCES.length];
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section>
      <PageHeader title={t("trending.title")} subtitle={t("trending.subtitle")} />

      <div role="tablist" aria-label={t("trending.tabsLabel")} onKeyDown={onKeyDown} className="mb-8 flex gap-6 border-b border-border">
        {CONTENT_SOURCES.map((source) => {
          const selected = source === active;
          return (
            <button
              key={source}
              ref={(node) => {
                tabRefs.current[source] = node;
              }}
              type="button"
              role="tab"
              id={`trending-tab-${source}`}
              aria-selected={selected}
              aria-controls="trending-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(source)}
              className={clsx("relative -mb-px inline-flex min-h-11 items-center pb-1 text-[0.95rem] transition-colors", selected ? "font-medium text-text" : "text-muted hover:text-text")}
            >
              {selected && <motion.span layoutId="trending-tab" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent" />}
              <span>{t(`trending.tabs.${source}`)}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id="trending-panel" aria-labelledby={`trending-tab-${active}`} aria-busy={isFetching}>
        {isLoading || (isFetching && !data) ? (
          <>
            <Spinner label={t("state.loading")} className="mb-4" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </>
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState title={t("state.emptyTitle")} body={t("state.emptyBody")} />
        ) : (
          <div className="flex flex-col gap-4">
            <DemoNotice sources={data.sources} />
            <ContentGrid key={active} items={data.items} label={t(`trending.tabs.${active}`)} />
          </div>
        )}
      </div>
    </section>
  );
}
