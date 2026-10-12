"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { setSearchQuery } from "@/features/search/searchSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export const SEARCH_DEBOUNCE_MS = 400;
export const MIN_QUERY_LENGTH = 2;

/**
 * Header search. Keystrokes update local state only; the Redux query (which triggers the
 * API request) changes after the user pauses for SEARCH_DEBOUNCE_MS, so typing "interstellar"
 * costs one request instead of twelve. Enter submits immediately. Press "/" to focus.
 */
export function SearchBar() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const committed = useAppSelector((state) => state.search.query);
  const [value, setValue] = useState(committed);
  const debounced = useDebouncedValue(value, SEARCH_DEBOUNCE_MS);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = (query: string) => {
    dispatch(setSearchQuery(query));
    if (query.trim().length >= MIN_QUERY_LENGTH && pathname !== "/search") router.push("/search");
  };

  useEffect(() => {
    if (debounced.trim() !== committed) commit(debounced);
    // Only react to the debounced value; `commit` and `committed` are intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable='true']");
      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    commit(value);
  };

  const clear = () => {
    setValue("");
    dispatch(setSearchQuery(""));
    inputRef.current?.focus();
  };

  return (
    <form role="search" onSubmit={onSubmit} className="relative w-full max-w-xl">
      <label htmlFor="global-search" className="sr-only">
        {t("header.searchLabel")}
      </label>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        id="global-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") clear();
        }}
        placeholder={t("header.searchPlaceholder")}
        autoComplete="off"
        maxLength={100}
        className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-10 pr-16 text-sm text-text placeholder:text-muted focus:border-accent focus:bg-surface focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={clear}
          aria-label={t("header.clearSearch")}
          className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-text"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 text-xs text-muted sm:block">
          /
        </kbd>
      )}
    </form>
  );
}
