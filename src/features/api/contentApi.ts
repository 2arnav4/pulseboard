import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { Category, ContentPage, ContentSource } from "@/types/content";
import type { SearchScope } from "@/features/search/searchSlice";

export interface FeedArgs {
  categories: Category[];
  /** TMDB id of the user's most recent movie; drives "because you liked" recommendations. */
  seed?: number;
}

export interface SearchArgs {
  q: string;
  type: SearchScope;
}

/**
 * Absolute base URL built at call time: browsers resolve "/api" themselves, but the
 * Node fetch used by tests (jsdom + MSW) needs an absolute URL.
 */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = (args, api, extra) => {
  const origin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  return fetchBaseQuery({ baseUrl: `${origin}/api` })(args, api, extra);
};

function nextPage(lastPage: ContentPage, _all: ContentPage[], lastPageParam: number): number | undefined {
  return lastPage.hasMore ? lastPageParam + 1 : undefined;
}

export const contentApi = createApi({
  reducerPath: "contentApi",
  baseQuery,
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    getFeed: build.infiniteQuery<ContentPage, FeedArgs, number>({
      infiniteQueryOptions: { initialPageParam: 1, getNextPageParam: nextPage, maxPages: 10 },
      query: ({ queryArg, pageParam }) => ({
        url: "/feed",
        params: {
          categories: queryArg.categories.join(","),
          page: pageParam,
          ...(queryArg.seed ? { seed: queryArg.seed } : {}),
        },
      }),
    }),
    searchContent: build.infiniteQuery<ContentPage, SearchArgs, number>({
      infiniteQueryOptions: { initialPageParam: 1, getNextPageParam: nextPage },
      query: ({ queryArg, pageParam }) => ({
        url: "/search",
        params: { q: queryArg.q, type: queryArg.type, page: pageParam },
      }),
    }),
    getTrending: build.query<ContentPage, ContentSource>({
      query: (source) => ({ url: "/trending", params: { source } }),
    }),
  }),
});

export const { useGetFeedInfiniteQuery, useSearchContentInfiniteQuery, useGetTrendingQuery } = contentApi;
