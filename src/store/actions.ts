import { createAction } from "@reduxjs/toolkit";
import type { PersistedState } from "@/lib/persistence";

/**
 * Dispatched once on the client after mount with whatever was saved in localStorage.
 * Hydrating after mount (not via preloadedState) keeps the server render and the
 * first client render identical, so there is no hydration mismatch.
 */
export const hydrateFromStorage = createAction<PersistedState>("app/hydrateFromStorage");
