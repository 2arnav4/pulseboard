import { describe, expect, it } from "vitest";
import favoritesReducer, { clearFavorites, toggleFavorite } from "@/features/favorites/favoritesSlice";
import feedReducer, { liveItemReceived, MAX_LIVE_ITEMS, revealLiveItems, setFeedOrder } from "@/features/feed/feedSlice";
import historyReducer, { itemOpened, tmdbIdOf } from "@/features/history/historySlice";
import preferencesReducer, {
  initialPreferences,
  setLanguage,
  toggleCategory,
  toggleTheme,
} from "@/features/preferences/preferencesSlice";
import { hydrateFromStorage } from "@/store/actions";
import { makeItem, movieItem, newsItem } from "../fixtures/content";

describe("preferences slice", () => {
  it("adds and removes categories", () => {
    let state = preferencesReducer(initialPreferences, toggleCategory("science"));
    expect(state.categories).toContain("science");
    state = preferencesReducer(state, toggleCategory("science"));
    expect(state.categories).not.toContain("science");
  });

  it("never removes the last remaining category", () => {
    const state = preferencesReducer({ ...initialPreferences, categories: ["sports"] }, toggleCategory("sports"));
    expect(state.categories).toEqual(["sports"]);
  });

  it("toggles theme and sets language", () => {
    expect(preferencesReducer(initialPreferences, toggleTheme()).theme).toBe("dark");
    expect(preferencesReducer(initialPreferences, setLanguage("hi")).language).toBe("hi");
  });

  it("hydrates from storage but keeps current state when nothing was saved", () => {
    const saved = { ...initialPreferences, theme: "dark" as const };
    expect(preferencesReducer(initialPreferences, hydrateFromStorage({ preferences: saved }))).toEqual(saved);
    expect(preferencesReducer(initialPreferences, hydrateFromStorage({}))).toBe(initialPreferences);
  });
});

describe("favorites slice", () => {
  it("toggles an item in and out, newest first", () => {
    let state = favoritesReducer(undefined, toggleFavorite(newsItem));
    state = favoritesReducer(state, toggleFavorite(movieItem));
    expect(state.items.map((item) => item.id)).toEqual([movieItem.id, newsItem.id]);
    state = favoritesReducer(state, toggleFavorite(newsItem));
    expect(state.items.map((item) => item.id)).toEqual([movieItem.id]);
    expect(favoritesReducer(state, clearFavorites()).items).toEqual([]);
  });
});

describe("feed slice", () => {
  it("stores drag-and-drop order", () => {
    expect(feedReducer(undefined, setFeedOrder(["b", "a"])).order).toEqual(["b", "a"]);
  });

  it("queues live items, ignores duplicates, and reveals them on demand", () => {
    let state = feedReducer(undefined, liveItemReceived(newsItem));
    state = feedReducer(state, liveItemReceived(newsItem));
    expect(state.pendingLive).toHaveLength(1);
    state = feedReducer(state, revealLiveItems());
    expect(state.pendingLive).toHaveLength(0);
    expect(state.liveItems.map((item) => item.id)).toEqual([newsItem.id]);
    // Already shown: a repeat from the stream must not reappear in the pending pill.
    expect(feedReducer(state, liveItemReceived(newsItem)).pendingLive).toHaveLength(0);
  });

  it("caps the pending queue", () => {
    let state = feedReducer(undefined, { type: "init" });
    for (let index = 0; index < MAX_LIVE_ITEMS + 5; index++) {
      state = feedReducer(state, liveItemReceived(makeItem({ id: `live-${index}` })));
    }
    expect(state.pendingLive).toHaveLength(MAX_LIVE_ITEMS);
    expect(state.pendingLive[0].id).toBe(`live-${MAX_LIVE_ITEMS + 4}`);
  });
});

describe("history slice", () => {
  it("extracts TMDB ids only from live movie items", () => {
    expect(tmdbIdOf(movieItem)).toBe(550);
    expect(tmdbIdOf(makeItem({ id: "movie-mock-3", source: "movie" }))).toBeNull();
    expect(tmdbIdOf(newsItem)).toBeNull();
  });

  it("records opened and favorited movies newest first without duplicates", () => {
    let state = historyReducer(undefined, itemOpened(movieItem));
    state = historyReducer(state, itemOpened(makeItem({ id: "movie-13", source: "movie" })));
    state = historyReducer(state, toggleFavorite(movieItem));
    expect(state.movieIds).toEqual([550, 13]);
    expect(historyReducer(state, itemOpened(newsItem))).toEqual(state);
  });
});
