import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContentCard } from "@/components/content/ContentCard";
import { PostComposer } from "@/components/social/PostComposer";
import { POST_MAX_LENGTH } from "@/lib/social";
import { newsItem, socialItem } from "../fixtures/content";
import { renderWithProviders } from "../utils/render";

const push = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push, replace: vi.fn() }) }));

describe("reactions", () => {
  it("shows starting counts on social posts and none on news", () => {
    renderWithProviders(<ContentCard item={socialItem} />);
    expect(screen.getAllByRole("button", { name: /reactions?$/ }).length).toBeGreaterThan(0);
  });

  it("adds a reaction from the quick tray and removes it by clicking the chip", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<ContentCard item={newsItem} />);
    expect(screen.queryByRole("button", { name: /reactions?$/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add a reaction to “Chip shortage eases”" }));
    await user.click(screen.getByRole("button", { name: "React with 🔥" }));
    expect(store.getState().social.reactions["news-1"]).toEqual(["🔥"]);

    const chip = screen.getByRole("button", { name: "🔥 1 reaction" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    await user.click(chip);
    expect(store.getState().social.reactions["news-1"]).toBeUndefined();
  });
});

describe("PostComposer", () => {
  it("posts trimmed text with its hashtags and clears the box", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<PostComposer />);
    const box = screen.getByRole("textbox", { name: "Write a post" });
    const postButton = screen.getByRole("button", { name: "Post" });
    expect(postButton).toBeDisabled();

    await user.type(box, "  Hello #Pulse  ");
    expect(screen.getByText(`${POST_MAX_LENGTH - 16} characters left`)).toBeInTheDocument();
    await user.click(postButton);

    const [post] = store.getState().social.posts;
    expect(post).toMatchObject({ title: "Hello #Pulse", author: "Ana Lee", category: "technology", hashtags: ["#pulse"] });
    expect(box).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent("Your post is live");
  });

  it("posts with Ctrl+Enter under the chosen topic", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<PostComposer />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Topic" }), "sports");
    await user.type(screen.getByRole("textbox", { name: "Write a post" }), "Match day{Control>}{Enter}{/Control}");
    expect(store.getState().social.posts[0]).toMatchObject({ title: "Match day", category: "sports" });
  });

  it("renders your own post with Delete instead of a link, and deletes it", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<PostComposer />);
    await user.type(screen.getByRole("textbox", { name: "Write a post" }), "Mine #x");
    await user.click(screen.getByRole("button", { name: "Post" }));
    const [post] = store.getState().social.posts;

    renderWithProviders(<ContentCard item={post} />, { store, persisted: null });
    const card = screen.getByTestId("content-card");
    expect(within(card).queryByRole("link")).not.toBeInTheDocument();
    expect(within(card).getByText("You")).toBeInTheDocument();
    await user.click(within(card).getByRole("button", { name: "Search #x" }));
    expect(store.getState().search.query).toBe("x");
    expect(push).toHaveBeenCalledWith("/search");
    await user.click(within(card).getByRole("button", { name: "Delete your post “Mine #x”" }));
    expect(store.getState().social.posts).toEqual([]);
  });
});
