import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Category } from "@/types/content";
import { hydrateFromStorage } from "@/store/actions";

export type Theme = "light" | "dark";
export const LANGUAGES = ["en", "hi", "es"] as const;
export type Language = (typeof LANGUAGES)[number];

export interface PreferencesState {
  categories: Category[];
  theme: Theme;
  language: Language;
  realtimeEnabled: boolean;
}

export const initialPreferences: PreferencesState = {
  categories: ["technology", "business", "sports"],
  theme: "light",
  language: "en",
  realtimeEnabled: true,
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState: initialPreferences,
  reducers: {
    toggleCategory(state, action: PayloadAction<Category>) {
      const category = action.payload;
      if (state.categories.includes(category)) {
        // Keep at least one category, otherwise the feed has nothing to personalize on.
        if (state.categories.length > 1) state.categories = state.categories.filter((c) => c !== category);
      } else {
        state.categories.push(category);
      }
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    setRealtimeEnabled(state, action: PayloadAction<boolean>) {
      state.realtimeEnabled = action.payload;
    },
    resetPreferences() {
      return initialPreferences;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateFromStorage, (state, action) => action.payload.preferences ?? state);
  },
});

export const { toggleCategory, setTheme, toggleTheme, setLanguage, setRealtimeEnabled, resetPreferences } =
  preferencesSlice.actions;
export default preferencesSlice.reducer;
