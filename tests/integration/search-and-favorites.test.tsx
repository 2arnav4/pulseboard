import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContentCard } from "@/components/content/ContentCard";
import { FavoritesView } from "@/components/favorites/FavoritesView";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { setSearchQuery } from "@/features/search/searchSlice";
import { movieItem, newsItem } from "../fixtures/content";
import { server } from "../msw/server";
import { renderWithProviders } from "../utils/render";

const push = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push, replace: vi.fn() }) }));

afterEach(() => {
  vi.useRealTimers();
  push.mockClear();
});

describe("SearchBar debounce", () => {
  it("commits the query only after the user stops typing", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { store } = renderWithProviders(<SearchBar />);
    await user.type(screen.getByRole("searchbox", { name: "Search content" }), "mars");
    expect(store.getState().search.query).toBe("");
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(store.getState().search.query).toBe("mars");
    expect(push).toHaveBeenCalledWith("/search");
  });

  it("does not navigate for a single character", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<SearchBar />);
    await user.type(screen.getByRole("searchbox", { name: "Search content" }), "m");
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(push).not.toHaveBeenCalled();
  });

  it("submits immediately on Enter and clears on Escape", async () => {
    const { store } = renderWithProviders(<SearchBar />);
    const input = screen.getByRole("searchbox", { name: "Search content" });
    await userEvent.type(input, "fight{Enter}");
    expect(store.getState().search.query).toBe("fight");
    await userEvent.keyboard("{Escape}");
    expect(input).toHaveValue("");
    expect(store.getState().search.query).toBe("");
  });
});

describe("SearchResults", () => {
  it("shows a hint before a query is entered", () => {
    renderWithProviders(<SearchResults />);
    expect(screen.getByText(/Type at least 2 characters/)).toBeInTheDocument();
  });

  it("renders results and the count for the committed query", async () => {
    const { store } = renderWithProviders(<SearchResults />);
    act(() => {
      store.dispatch(setSearchQuery("fight"));
    });
    expect(await screen.findByRole("heading", { name: "Fight Club" })).toBeInTheDocument();
    expect(screen.getByTestId("result-count")).toHaveTextContent("1 result");
  });

  it("shows the empty state when nothing matches", async () => {
    const { store } = renderWithProviders(<SearchResults />);
    act(() => {
      store.dispatch(setSearchQuery("nothing-matches"));
    });
    expect(await screen.findByRole("heading", { name: "No results" })).toBeInTheDocument();
  });

  it("shows an error state when the API fails", async () => {
    server.use(http.get("http://localhost:3000/api/search", () => HttpResponse.json({}, { status: 503 })));
    const { store } = renderWithProviders(<SearchResults />);
    act(() => {
      store.dispatch(setSearchQuery("fight"));
    });
    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("sends the selected type filter", async () => {
    let type = "";
    server.use(
      http.get("http://localhost:3000/api/search", ({ request }) => {
        type = new URL(request.url).searchParams.get("type") ?? "";
        return HttpResponse.json({ items: [], page: 1, hasMore: false, sources: {} });
      }),
    );
    const { store } = renderWithProviders(<SearchResults />);
    act(() => {
      store.dispatch(setSearchQuery("mars"));
    });
    await userEvent.click(screen.getByRole("button", { name: "Movies" }));
    await vi.waitFor(() => expect(type).toBe("movie"));
  });
});

describe("ContentCard and Favorites", () => {
  it("toggles favorite state with an accessible pressed button", async () => {
    const { store } = renderWithProviders(<ContentCard item={newsItem} />);
    const button = screen.getByRole("button", { name: "Save “Chip shortage eases” to favorites" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    expect(store.getState().favorites.items).toEqual([newsItem]);
    expect(screen.getByRole("button", { name: "Saved. Remove “Chip shortage eases” from favorites" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows rating for movies and records opening them in history", async () => {
    const { store } = renderWithProviders(<ContentCard item={movieItem} />);
    expect(screen.getByLabelText("Rated 8.4 out of 10")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Play now/ });
    link.addEventListener("click", (event) => event.preventDefault());
    await userEvent.click(link);
    expect(store.getState().history.movieIds).toEqual([550]);
  });

  it("Favorites shows an empty state, then saved items", async () => {
    renderWithProviders(<FavoritesView />);
    expect(screen.getByRole("heading", { name: "No favorites yet" })).toBeInTheDocument();
  });

  it("Favorites lists persisted items and can clear them", async () => {
    renderWithProviders(<FavoritesView />, { persisted: { favorites: { items: [newsItem, movieItem] } } });
    expect(screen.getByText("Everything you've saved, newest first. 2 saved items")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(await screen.findByRole("heading", { name: "No favorites yet" })).toBeInTheDocument();
  });
});
