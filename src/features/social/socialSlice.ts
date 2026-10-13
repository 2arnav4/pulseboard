import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import { extractHashtags, MAX_POSTS, MAX_REACTIONS_PER_ITEM, OWN_POST_PREFIX, POST_MAX_LENGTH } from "@/lib/social";
import { hydrateFromStorage } from "@/store/actions";
import type { Category, ContentItem } from "@/types/content";

export interface SocialState {
  /** Item id → emojis the user reacted with (several allowed, like Slack). */
  reactions: Record<string, string[]>;
  /** Posts the user wrote, newest first. */
  posts: ContentItem[];
}

const initialState: SocialState = { reactions: {}, posts: [] };

export interface NewPost {
  text: string;
  category: Category;
  author: string;
}

const socialSlice = createSlice({
  name: "social",
  initialState,
  reducers: {
    toggleReaction(state, action: PayloadAction<{ itemId: string; emoji: string }>) {
      const { itemId, emoji } = action.payload;
      const current = state.reactions[itemId] ?? [];
      const next = current.includes(emoji) ? current.filter((value) => value !== emoji) : [...current, emoji];
      if (next.length > MAX_REACTIONS_PER_ITEM) return;
      if (next.length === 0) delete state.reactions[itemId];
      else state.reactions[itemId] = next;
    },
    postCreated: {
      reducer(state, action: PayloadAction<ContentItem>) {
        state.posts = [action.payload, ...state.posts].slice(0, MAX_POSTS);
      },
      // id and timestamp are generated here, keeping the reducer pure.
      prepare({ text, category, author }: NewPost) {
        const body = text.trim().slice(0, POST_MAX_LENGTH);
        return {
          payload: {
            id: `${OWN_POST_PREFIX}${nanoid(10)}`,
            source: "social",
            title: body,
            description: "",
            imageUrl: null,
            url: "",
            category,
            publishedAt: new Date().toISOString(),
            author,
            likes: 0,
            hashtags: extractHashtags(body),
          } satisfies ContentItem,
        };
      },
    },
    postDeleted(state, action: PayloadAction<string>) {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
      delete state.reactions[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateFromStorage, (state, action) => action.payload.social ?? state);
  },
});

export const { toggleReaction, postCreated, postDeleted } = socialSlice.actions;
export default socialSlice.reducer;
