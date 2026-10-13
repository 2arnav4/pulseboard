"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { loadPersistedState, savePersistedState, storageKeyFor } from "@/lib/persistence";
import { hydrateFromStorage } from "@/store/actions";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks";
import { selectPersistedState } from "@/store/store";

/**
 * Bridges Redux and the browser for the signed-in user:
 * 1. loads their saved state from localStorage once (per-user key),
 * 2. saves relevant slices back whenever they change,
 * 3. applies theme and language to <html> and i18next.
 */
export function useClientStateSync(userId: string) {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const { i18n } = useTranslation();
  const hydrated = useAppSelector((state) => state.app.hydrated);
  const theme = useAppSelector((state) => state.preferences.theme);
  const language = useAppSelector((state) => state.preferences.language);

  useEffect(() => {
    const key = storageKeyFor(userId);
    dispatch(hydrateFromStorage(loadPersistedState(window.localStorage, key) ?? {}));

    // Save synchronously (a debounce would lose a change made just before a reload or tab close),
    // but only when a persisted slice changed: Redux keeps references stable for untouched slices,
    // so RTK Query cache updates cost one cheap comparison and no localStorage write.
    let previous = selectPersistedState(store.getState());
    return store.subscribe(() => {
      const next = selectPersistedState(store.getState());
      const changed = (Object.keys(next) as (keyof typeof next)[]).some((field) => next[field] !== previous[field]);
      if (!changed) return;
      previous = next;
      savePersistedState(window.localStorage, key, next);
    });
  }, [dispatch, store, userId]);

  useEffect(() => {
    if (!hydrated) return; // Until then the inline script in <head> owns the theme class.
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [hydrated, theme]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = language;
    void i18n.changeLanguage(language);
  }, [hydrated, language, i18n]);
}
