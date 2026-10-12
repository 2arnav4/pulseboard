import { describe, expect, it } from "vitest";
import { applyCustomOrder, hashString, interleave, matchesQuery, paginate, uniqueById } from "@/lib/content";
import { makeItem } from "../fixtures/content";

describe("interleave", () => {
  it("alternates between lists and keeps leftovers from longer lists", () => {
    expect(interleave([[1, 2, 3], ["a"], [true, false]])).toEqual([1, "a", true, 2, false, 3]);
  });

  it("handles no lists and empty lists", () => {
    expect(interleave([])).toEqual([]);
    expect(interleave([[], []])).toEqual([]);
  });
});

describe("paginate", () => {
  const items = [1, 2, 3, 4, 5];

  it("returns the requested 1-based page and whether more remain", () => {
    expect(paginate(items, 1, 2)).toEqual({ items: [1, 2], hasMore: true });
    expect(paginate(items, 3, 2)).toEqual({ items: [5], hasMore: false });
  });

  it("treats page numbers below 1 as page 1 and returns empty past the end", () => {
    expect(paginate(items, 0, 2).items).toEqual([1, 2]);
    expect(paginate(items, 9, 2)).toEqual({ items: [], hasMore: false });
  });
});

describe("matchesQuery", () => {
  const item = makeItem({ id: "x", title: "Mars rover lands", hashtags: ["#space"], author: "@labnotes" });

  it("matches title, hashtags and author case-insensitively", () => {
    expect(matchesQuery(item, "MARS")).toBe(true);
    expect(matchesQuery(item, "#space")).toBe(true);
    expect(matchesQuery(item, "labnotes")).toBe(true);
  });

  it("treats a blank query as a match and rejects unrelated text", () => {
    expect(matchesQuery(item, "   ")).toBe(true);
    expect(matchesQuery(item, "football")).toBe(false);
  });
});

describe("applyCustomOrder", () => {
  const items = ["a", "b", "c", "d"].map((id) => makeItem({ id }));

  it("puts user-ordered items first in saved order, new items after in API order", () => {
    expect(applyCustomOrder(items, ["c", "a"]).map((item) => item.id)).toEqual(["c", "a", "b", "d"]);
  });

  it("ignores saved ids that are no longer in the feed", () => {
    expect(applyCustomOrder(items, ["gone", "d"]).map((item) => item.id)).toEqual(["d", "a", "b", "c"]);
  });

  it("returns a copy in API order when no custom order exists", () => {
    const result = applyCustomOrder(items, []);
    expect(result).toEqual(items);
    expect(result).not.toBe(items);
  });
});

describe("uniqueById / hashString", () => {
  it("drops later duplicates", () => {
    const items = [makeItem({ id: "a", title: "first" }), makeItem({ id: "a", title: "second" })];
    expect(uniqueById(items).map((item) => item.title)).toEqual(["first"]);
  });

  it("hashes deterministically", () => {
    expect(hashString("https://a.com")).toBe(hashString("https://a.com"));
    expect(hashString("https://a.com")).not.toBe(hashString("https://b.com"));
  });
});
