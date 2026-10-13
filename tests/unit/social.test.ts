import { describe, expect, it } from "vitest";
import socialReducer, { postCreated, postDeleted, toggleReaction } from "@/features/social/socialSlice";
import { loadPersistedState, savePersistedState } from "@/lib/persistence";
import {
  baseReactions,
  combineReactions,
  extractHashtags,
  isOwnPost,
  MAX_REACTIONS_PER_ITEM,
  POST_MAX_LENGTH,
} from "@/lib/social";
import { hydrateFromStorage } from "@/store/actions";
import { makeItem } from "../fixtures/content";

const empty = { reactions: {}, posts: [] };

describe("social helpers", () => {
  it("extracts unique lowercase hashtags, including non-Latin ones", () => {
    expect(extractHashtags("Loving #AI and #ai, also #क्रिकेट! no#tag? #ml_ops")).toEqual(["#ai", "#क्रिकेट", "#ml_ops"]);
  });

  it("splits likes into deterministic starting reactions", () => {
    const item = makeItem({ id: "social-tech-1", likes: 1000 });
    const first = baseReactions(item);
    expect(first).toEqual(baseReactions(item));
    expect(Object.values(first).reduce((sum, count) => sum + count, 0)).toBe(1000);
    expect(baseReactions(makeItem({ id: "news-1", likes: undefined }))).toEqual({});
  });

  it("adds the user's reactions on top and sorts by count", () => {
    expect(combineReactions({ "👍": 2, "🔥": 5 }, ["👍", "😂"])).toEqual([
      { emoji: "🔥", count: 5, mine: false },
      { emoji: "👍", count: 3, mine: true },
      { emoji: "😂", count: 1, mine: true },
    ]);
  });
});

describe("social slice", () => {
  it("toggles reactions and drops empty entries", () => {
    let state = socialReducer(empty, toggleReaction({ itemId: "a", emoji: "🔥" }));
    state = socialReducer(state, toggleReaction({ itemId: "a", emoji: "😂" }));
    expect(state.reactions.a).toEqual(["🔥", "😂"]);
    state = socialReducer(state, toggleReaction({ itemId: "a", emoji: "🔥" }));
    state = socialReducer(state, toggleReaction({ itemId: "a", emoji: "😂" }));
    expect(state.reactions).toEqual({});
  });

  it("caps reactions per item", () => {
    let state = socialReducer(undefined, { type: "init" });
    for (let index = 0; index < MAX_REACTIONS_PER_ITEM + 3; index++) {
      state = socialReducer(state, toggleReaction({ itemId: "a", emoji: `e${index}` }));
    }
    expect(state.reactions.a).toHaveLength(MAX_REACTIONS_PER_ITEM);
  });

  it("creates a trimmed post with hashtags and deletes it with its reactions", () => {
    let state = socialReducer(empty, postCreated({ text: `  Hello #world ${"x".repeat(400)}`, category: "technology", author: "Ana" }));
    const [post] = state.posts;
    expect(isOwnPost(post)).toBe(true);
    expect(post.title.length).toBe(POST_MAX_LENGTH);
    expect(post.hashtags).toEqual(["#world"]);
    expect(post.author).toBe("Ana");
    state = socialReducer(state, toggleReaction({ itemId: post.id, emoji: "❤️" }));
    state = socialReducer(state, postDeleted(post.id));
    expect(state).toEqual(empty);
  });

  it("restores saved reactions and posts on hydrate", () => {
    const saved = { reactions: { a: ["🔥"] }, posts: [makeItem({ id: "post-1" })] };
    expect(socialReducer(empty, hydrateFromStorage({ social: saved }))).toEqual(saved);
    expect(socialReducer(saved, hydrateFromStorage({}))).toEqual(saved);
  });

  it("persists through localStorage and still loads data saved before social existed", () => {
    const saved = { reactions: { a: ["🔥"] }, posts: [makeItem({ id: "post-1" })] };
    savePersistedState(window.localStorage, "k", { social: saved });
    expect(loadPersistedState(window.localStorage, "k")?.social).toEqual(saved);
    window.localStorage.setItem("old", JSON.stringify({ version: 1, feedOrder: ["x"] }));
    expect(loadPersistedState(window.localStorage, "old")).toEqual({ feedOrder: ["x"] });
  });
});
