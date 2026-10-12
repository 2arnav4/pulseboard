import { createSlice } from "@reduxjs/toolkit";
import { hydrateFromStorage } from "@/store/actions";

export interface AppState {
  /**
   * False until saved preferences are loaded. Data fetching waits for this so the
   * first request already uses the user's categories (no wasted NewsAPI call).
   */
  hydrated: boolean;
}

const appSlice = createSlice({
  name: "app",
  initialState: { hydrated: false } as AppState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(hydrateFromStorage, (state) => {
      state.hydrated = true;
    });
  },
});

export default appSlice.reducer;
