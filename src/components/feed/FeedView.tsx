"use client";

import { RotateCcw, Settings } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ContentCard } from "@/components/content/ContentCard";
import { Button } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Spinner } from "@/components/ui/Spinner";
import { useGetFeedInfiniteQuery } from "@/features/api/contentApi";
import { resetFeedOrder } from "@/features/feed/feedSlice";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import { applyCustomOrder, uniqueById } from "@/lib/content";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { ContentPage } from "@/types/content";
import { NewPostsPill } from "./NewPostsPill";
import { RealtimeIndicator } from "./RealtimeIndicator";
import { SortableFeedList } from "./SortableFeedList";

function mergeSources(pages: ContentPage[] | undefined): ContentPage["sources"] {
  const merged: ContentPage["sources"] = {};
  for (const page of pages ?? []) {
    for (const [source, status] of Object.entries(page.sources) as [keyof ContentPage["sources"], ContentPage["sources"][keyof ContentPage["sources"]]][]) {
      if (merged[source] !== "mock") merged[source] = status;
    }
  }
  return merged;
}

/** The personalized, unified feed: news + recommendations + social posts, infinite scroll, drag-to-reorder, live posts. */
export function FeedView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((state) => state.app.hydrated);
  const categories = useAppSelector((state) => state.preferences.categories);
  const order = useAppSelector((state) => state.feed.order);
  const liveItems = useAppSelector((state) => state.feed.liveItems);
  const seedMovieId = useAppSelector((state) => state.feed.seedMovieId);
  const realtimeStatus = useRealtimeFeed();

  // Wait for saved preferences so the first request already uses the user's categories.
  const { data, isLoading, isError, isFetchingNextPage, isFetchNextPageError, hasNextPage, fetchNextPage, refetch } =
    useGetFeedInfiniteQuery({ categories, ...(seedMovieId ? { seed: seedMovieId } : {}) }, { skip: !hydrated });

  const items = useMemo(() => uniqueById(data?.pages.flatMap((page) => page.items) ?? []), [data]);
  const orderedItems = useMemo(() => applyCustomOrder(items, order), [items, order]);
  const sources = useMemo(() => mergeSources(data?.pages), [data]);
  const canLoadMore = hasNextPage && !isFetchingNextPage && !isFetchNextPageError;
  const sentinelRef = useInfiniteScroll<HTMLDivElement>(() => void fetchNextPage(), canLoadMore);

  const categoryNames = categories.map((category) => t(`categories.${category}`)).join(", ");

  const header = (
    <PageHeader
      title={t("feed.title")}
      subtitle={t("feed.subtitle", { categories: categoryNames })}
      actions={
        <>
          <RealtimeIndicator status={realtimeStatus} />
          {order.length > 0 && (
            <Button variant="secondary" onClick={() => dispatch(resetFeedOrder())}>
              <RotateCcw aria-hidden="true" className="size-4" />
              {t("feed.resetOrder")}
            </Button>
          )}
        </>
      }
    />
  );

  if (!hydrated || isLoading) {
    return (
      <section aria-busy="true">
        {header}
        <Spinner label={t("state.loading")} className="mb-4" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonCard key={index} layout="row" />
          ))}
        </div>
      </section>
    );
  }

  if (isError && items.length === 0) {
    return (
      <section>
        {header}
        <ErrorState onRetry={() => void refetch()} />
      </section>
    );
  }

  if (items.length === 0 && liveItems.length === 0) {
    return (
      <section>
        {header}
        <EmptyState
          title={t("state.emptyTitle")}
          body={t("state.emptyBody")}
          action={
            <Link href="/settings" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-accent-contrast hover:bg-accent-hover">
              <Settings aria-hidden="true" className="size-4" />
              {t("nav.settings")}
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {header}
      <DemoNotice sources={sources} />
      <NewPostsPill />

      {liveItems.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t("feed.liveSection")}</h2>
          <ul aria-label={t("feed.liveSection")} className="flex flex-col gap-4">
            {liveItems.map((item) => (
              <li key={item.id}>
                <ContentCard item={item} layout="row" />
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm text-muted">{t("feed.dragHint")}</p>
      <SortableFeedList items={orderedItems} label={t("feed.title")} />

      <div ref={sentinelRef} className="flex min-h-16 items-center justify-center py-4">
        {isFetchingNextPage ? (
          <Spinner label={t("feed.loadingMore")} />
        ) : isFetchNextPageError ? (
          <Button variant="secondary" onClick={() => void fetchNextPage()}>
            {t("state.retry")}
          </Button>
        ) : hasNextPage ? (
          <Button variant="secondary" onClick={() => void fetchNextPage()}>
            {t("feed.loadMore")}
          </Button>
        ) : (
          <p className="text-sm text-muted">{t("feed.end")}</p>
        )}
      </div>
    </section>
  );
}
