import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentItem } from "@/types/content";
import { hydrateFromStorage } from "@/store/actions";

export interface FavoritesState {
  /** Full items are stored so favorites still render when the source API no longer returns them. */
  items: ContentItem[];
}

const initialState: FavoritesState = { items: [] };

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<ContentItem>) {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index >= 0) state.items.splice(index, 1);
      else state.items.unshift(action.payload);
    },
    removeFavorite(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearFavorites(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateFromStorage, (state, action) => action.payload.favorites ?? state);
  },
});

export const { toggleFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
