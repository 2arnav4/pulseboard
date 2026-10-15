import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { FeedView } from "@/components/feed/FeedView";
import { makePage, newsItem } from "../fixtures/content";
import { server } from "../msw/server";
import { renderWithProviders } from "../utils/render";

vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));

const FEED = "http://localhost:3000/api/feed";

describe("FeedView", () => {
  it("renders news, movie and social cards from the unified feed", async () => {
    renderWithProviders(<FeedView />);
    expect(await screen.findByRole("heading", { name: "Chip shortage eases" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fight Club" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "@devdiaries: Shipped dark mode" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Read more/ })).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: /Play now/ })).toBeInTheDocument();
    // Mock social posts have nowhere to link to, so they get no "View post" link.
    expect(screen.queryByRole("link", { name: /View post/ })).not.toBeInTheDocument();
  });

  it("does not request data before saved preferences are hydrated", async () => {
    const onRequest = vi.fn();
    server.events.on("request:start", onRequest);
    renderWithProviders(<FeedView />, { persisted: null });
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onRequest).not.toHaveBeenCalled();
    server.events.removeAllListeners();
  });

  it("requests the user's saved categories", async () => {
    let requested = "";
    server.use(
      http.get(FEED, ({ request }) => {
        requested = new URL(request.url).searchParams.get("categories") ?? "";
        return HttpResponse.json(makePage([newsItem]));
      }),
    );
    renderWithProviders(<FeedView />, {
      persisted: { preferences: { categories: ["science", "health"], theme: "light", language: "en", realtimeEnabled: false } },
    });
    await screen.findByRole("heading", { name: "Chip shortage eases" });
    expect(requested).toBe("science,health");
  });

  it("shows an empty state when no content comes back", async () => {
    server.use(http.get(FEED, () => HttpResponse.json(makePage([]))));
    renderWithProviders(<FeedView />);
    expect(await screen.findByRole("heading", { name: "Nothing here yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
  });

  it("shows an error state and recovers on retry", async () => {
    let fail = true;
    server.use(
      http.get(FEED, () => (fail ? HttpResponse.json({ error: "boom" }, { status: 500 }) : HttpResponse.json(makePage([newsItem])))),
    );
    renderWithProviders(<FeedView />);
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("Something went wrong")).toBeInTheDocument();
    fail = false;
    await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { name: "Chip shortage eases" })).toBeInTheDocument();
  });

  it("flags demo data when a live source fell back", async () => {
    server.use(http.get(FEED, () => HttpResponse.json(makePage([newsItem], { sources: { news: "mock", movie: "live", social: "mock" } }))));
    renderWithProviders(<FeedView />);
    expect(await screen.findByText(/Showing demo data for News/)).toBeInTheDocument();
  });

  it("loads the next page and shows the end of the feed", async () => {
    renderWithProviders(<FeedView />);
    await screen.findByRole("heading", { name: "Chip shortage eases" });
    await userEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(await screen.findByRole("heading", { name: "Page 2 story" })).toBeInTheDocument();
    expect(screen.getByText("You're all caught up.")).toBeInTheDocument();
  });

  it("reorders with the keyboard move buttons and stores the order in Redux", async () => {
    const { store } = renderWithProviders(<FeedView />);
    await screen.findByRole("heading", { name: "Chip shortage eases" });
    await userEvent.click(screen.getByRole("button", { name: "Move “Chip shortage eases” down" }));
    await waitFor(() => expect(store.getState().feed.order.slice(0, 2)).toEqual(["movie-550", "news-1"]));
    const titles = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent);
    expect(titles.slice(0, 2)).toEqual(["Fight Club", "Chip shortage eases"]);
    expect(screen.getByText("Moved “Chip shortage eases” to position 2.")).toBeInTheDocument();
  });
});
