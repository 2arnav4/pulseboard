import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentSource } from "@/types/content";

export type SearchScope = ContentSource | "all";

export interface SearchState {
  /** The debounced query: only updated after the user pauses typing. */
  query: string;
  scope: SearchScope;
}

const initialState: SearchState = { query: "", scope: "all" };

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.query = action.payload.trim();
    },
    setSearchScope(state, action: PayloadAction<SearchScope>) {
      state.scope = action.payload;
    },
  },
});

export const { setSearchQuery, setSearchScope } = searchSlice.actions;
export default searchSlice.reducer;
