import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContentItem } from "@/types/content";
import { hydrateFromStorage } from "@/store/actions";

/** Cap so a tab left open all day does not grow the live list without bound. */
export const MAX_LIVE_ITEMS = 30;

export interface FeedState {
  /** Card ids in the order the user dragged them into (persisted). */
  order: string[];
  /** Real-time posts received over SSE but not yet shown (the "N new posts" pill). */
  pendingLive: ContentItem[];
  /** Real-time posts the user has revealed; rendered above the regular feed. */
  liveItems: ContentItem[];
}

const initialState: FeedState = { order: [], pendingLive: [], liveItems: [] };

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    setFeedOrder(state, action: PayloadAction<string[]>) {
      state.order = action.payload;
    },
    resetFeedOrder(state) {
      state.order = [];
    },
    liveItemReceived(state, action: PayloadAction<ContentItem>) {
      const id = action.payload.id;
      if (state.pendingLive.some((item) => item.id === id) || state.liveItems.some((item) => item.id === id)) return;
      state.pendingLive = [action.payload, ...state.pendingLive].slice(0, MAX_LIVE_ITEMS);
    },
    revealLiveItems(state) {
      state.liveItems = [...state.pendingLive, ...state.liveItems].slice(0, MAX_LIVE_ITEMS);
      state.pendingLive = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateFromStorage, (state, action) => {
      if (action.payload.feedOrder) state.order = action.payload.feedOrder;
    });
  },
});

export const { setFeedOrder, resetFeedOrder, liveItemReceived, revealLiveItems } = feedSlice.actions;
export default feedSlice.reducer;
