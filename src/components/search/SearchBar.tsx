"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { CloseGlyph, SearchGlyph } from "@/components/ui/icons";
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
  // The query can also change from outside (clicking a hashtag). Adjusting state during render
  // (React's documented pattern) keeps the input in sync without an effect. The trim comparison
  // stops our own debounced commit from eating a trailing space the user is still typing.
  const [lastCommitted, setLastCommitted] = useState(committed);
  if (committed !== lastCommitted) {
    setLastCommitted(committed);
    if (committed !== value.trim()) setValue(committed);
  }
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
      <SearchGlyph className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
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
        className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-14 text-sm text-text transition-colors placeholder:text-muted hover:border-muted/60 focus:border-text focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={clear}
          aria-label={t("header.clearSearch")}
          className="absolute right-1.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
        >
          <CloseGlyph className="size-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border px-1.5 font-mono text-[11px] text-muted sm:block">
          /
        </kbd>
      )}
    </form>
  );
}
