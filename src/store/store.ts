import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { contentApi } from "@/features/api/contentApi";
import appReducer from "@/features/app/appSlice";
import favoritesReducer from "@/features/favorites/favoritesSlice";
import feedReducer from "@/features/feed/feedSlice";
import historyReducer from "@/features/history/historySlice";
import preferencesReducer from "@/features/preferences/preferencesSlice";
import searchReducer from "@/features/search/searchSlice";
import type { PersistedState } from "@/lib/persistence";

export const rootReducer = combineReducers({
  app: appReducer,
  preferences: preferencesReducer,
  favorites: favoritesReducer,
  feed: feedReducer,
  search: searchReducer,
  history: historyReducer,
  [contentApi.reducerPath]: contentApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/** A fresh store per request/render tree (Next.js shares module scope across requests on the server). */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(contentApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

/** The slice of state that survives reloads. */
export function selectPersistedState(state: RootState): PersistedState {
  return {
    preferences: state.preferences,
    favorites: state.favorites,
    history: state.history,
    feedOrder: state.feed.order,
  };
}
