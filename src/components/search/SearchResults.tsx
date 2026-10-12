"use client";

import { SearchX } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { ContentGrid } from "@/components/content/ContentGrid";
import { Button } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSearchContentInfiniteQuery } from "@/features/api/contentApi";
import { setSearchScope, type SearchScope } from "@/features/search/searchSlice";
import { uniqueById } from "@/lib/content";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { MIN_QUERY_LENGTH } from "./SearchBar";

const SCOPES: SearchScope[] = ["all", "news", "movie", "social"];

/** Results for the debounced query in Redux, filterable by type, with "Load more" pagination. */
export function SearchResults() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.search.query);
  const scope = useAppSelector((state) => state.search.scope);
  const ready = query.length >= MIN_QUERY_LENGTH;

  const { data, isFetching, isError, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useSearchContentInfiniteQuery(
    ready ? { q: query, type: scope } : skipToken,
  );
  const items = useMemo(() => uniqueById(data?.pages.flatMap((page) => page.items) ?? []), [data]);
  const initialLoading = isFetching && !isFetchingNextPage;

  return (
    <section>
      <PageHeader title={ready ? t("search.resultsFor", { query }) : t("search.title")} />

      <div role="group" aria-label={t("search.scopeLabel")} className="mb-6 flex flex-wrap gap-2">
        {SCOPES.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={scope === value}
            onClick={() => dispatch(setSearchScope(value))}
            className={clsx(
              "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors",
              scope === value ? "border-accent bg-accent text-accent-contrast" : "border-border bg-surface text-muted hover:text-text",
            )}
          >
            {t(`search.scope.${value}`)}
          </button>
        ))}
      </div>

      <div aria-live="polite" aria-busy={initialLoading}>
        {!ready ? (
          <EmptyState title={t("search.title")} body={t("search.hint")} />
        ) : initialLoading ? (
          <Spinner label={t("state.loading")} />
        ) : isError && items.length === 0 ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <EmptyState icon={SearchX} title={t("search.emptyTitle")} body={t("search.emptyBody")} />
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted" data-testid="result-count">
              {t("search.resultCount", { count: items.length })}
            </p>
            <DemoNotice sources={data?.pages[0]?.sources} />
            <ContentGrid items={items} label={t("search.resultsFor", { query })} />
            {hasNextPage && (
              <div className="flex justify-center py-4">
                {isFetchingNextPage ? (
                  <Spinner label={t("feed.loadingMore")} />
                ) : (
                  <Button variant="secondary" onClick={() => void fetchNextPage()}>
                    {t("feed.loadMore")}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
