import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentItem } from "@/types/content";
import { hydrateFromStorage } from "@/store/actions";
import { toggleFavorite } from "@/features/favorites/favoritesSlice";

const MAX_HISTORY = 20;

export interface HistoryState {
  /** TMDB ids of movies the user opened or favorited, newest first. Seeds recommendations. */
  movieIds: number[];
}

const initialState: HistoryState = { movieIds: [] };

/** Live TMDB items have ids like "movie-550"; demo items ("movie-mock-3") have no TMDB id. */
export function tmdbIdOf(item: Pick<ContentItem, "id" | "source">): number | null {
  if (item.source !== "movie") return null;
  const match = /^movie-(\d+)$/.exec(item.id);
  return match ? Number(match[1]) : null;
}

function remember(state: HistoryState, item: ContentItem) {
  const tmdbId = tmdbIdOf(item);
  if (tmdbId === null) return;
  state.movieIds = [tmdbId, ...state.movieIds.filter((id) => id !== tmdbId)].slice(0, MAX_HISTORY);
}

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    itemOpened(state, action: PayloadAction<ContentItem>) {
      remember(state, action.payload);
    },
    clearHistory(state) {
      state.movieIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleFavorite, (state, action) => remember(state, action.payload))
      .addCase(hydrateFromStorage, (state, action) => action.payload.history ?? state);
  },
});

export const { itemOpened, clearHistory } = historySlice.actions;
export default historySlice.reducer;
