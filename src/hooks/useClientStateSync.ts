"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { loadPersistedState, savePersistedState, storageKeyFor } from "@/lib/persistence";
import { hydrateFromStorage } from "@/store/actions";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks";
import { selectPersistedState } from "@/store/store";

const SAVE_DELAY_MS = 250;

/**
 * Bridges Redux and the browser for the signed-in user:
 * 1. loads their saved state from localStorage once (per-user key),
 * 2. saves relevant slices back whenever they change (debounced),
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

    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastSaved = "";
    const unsubscribe = store.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const snapshot = selectPersistedState(store.getState());
        const serialized = JSON.stringify(snapshot);
        if (serialized === lastSaved) return; // Most actions (API cache updates) do not touch persisted slices.
        lastSaved = serialized;
        savePersistedState(window.localStorage, key, snapshot);
      }, SAVE_DELAY_MS);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
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
