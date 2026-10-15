import { describe, expect, it } from "vitest";
import { initialPreferences } from "@/features/preferences/preferencesSlice";
import { loadPersistedState, savePersistedState, storageKeyFor, THEME_STORAGE_KEY } from "@/lib/persistence";
import { newsItem } from "../fixtures/content";

describe("persistence", () => {
  const key = storageKeyFor("user-1");

  it("round-trips preferences, favorites, history and feed order", () => {
    const state = {
      preferences: { ...initialPreferences, theme: "dark" as const },
      favorites: { items: [newsItem] },
      history: { movieIds: [550] },
      feedOrder: ["b", "a"],
    };
    savePersistedState(localStorage, key, state);
    expect(loadPersistedState(localStorage, key)).toEqual(state);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("drops placeholder links from mock items saved by older versions", () => {
    const legacy = { ...newsItem, id: "social-science-9", source: "social" as const, url: "https://example.com/social/science/9" };
    savePersistedState(localStorage, key, { favorites: { items: [legacy, newsItem] } });
    const [migrated, untouched] = loadPersistedState(localStorage, key)?.favorites?.items ?? [];
    expect(migrated.url).toBe("");
    expect(untouched.url).toBe(newsItem.url);
  });

  it("returns null when nothing is stored", () => {
    expect(loadPersistedState(localStorage, key)).toBeNull();
  });

  it("returns null for corrupted JSON instead of throwing", () => {
    localStorage.setItem(key, "{not json");
    expect(loadPersistedState(localStorage, key)).toBeNull();
  });

  it("rejects data with an invalid shape or an old version", () => {
    localStorage.setItem(key, JSON.stringify({ version: 1, preferences: { categories: ["cooking"] } }));
    expect(loadPersistedState(localStorage, key)).toBeNull();
    localStorage.setItem(key, JSON.stringify({ version: 0, feedOrder: [] }));
    expect(loadPersistedState(localStorage, key)).toBeNull();
  });

  it("keeps users separate", () => {
    expect(storageKeyFor("a")).not.toBe(storageKeyFor("b"));
  });

  it("swallows storage errors such as an exceeded quota", () => {
    const failing = { setItem: () => { throw new Error("QuotaExceededError"); } } as unknown as Storage;
    expect(() => savePersistedState(failing, key, { feedOrder: [] })).not.toThrow();
  });
});
