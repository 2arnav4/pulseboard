import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

test.describe("search", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
  });

  test("debounces typing into a single request and shows matching results", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/search")) requests.push(request.url());
    });

    // Type character by character, faster than the 400 ms debounce.
    await page.getByRole("searchbox", { name: "Search content" }).pressSequentially("interstellar", { delay: 40 });

    await expect(page).toHaveURL("/search");
    await expect(page.getByRole("heading", { name: "Results for “interstellar”" })).toBeVisible();
    await expect(page.getByRole("article").filter({ hasText: "Interstellar" })).toBeVisible();
    expect(requests).toHaveLength(1);
    expect(new URL(requests[0]).searchParams.get("q")).toBe("interstellar");
  });

  test("filters results by type", async ({ page }) => {
    await page.getByRole("searchbox", { name: "Search content" }).fill("#cricket");
    await expect(page).toHaveURL("/search");
    await page.getByRole("button", { name: "Posts", exact: true }).click();
    await expect(page.getByRole("button", { name: "Posts", exact: true })).toHaveAttribute("aria-pressed", "true");
    const cards = page.getByTestId("content-card");
    await expect(cards.first()).toBeVisible();
    for (const label of await cards.locator("span.uppercase").allTextContents()) {
      expect(label).toBe("Social");
    }
  });

  test("shows an empty state when nothing matches", async ({ page }) => {
    await page.getByRole("searchbox", { name: "Search content" }).fill("zzzz-no-such-thing");
    await expect(page.getByRole("heading", { name: "No results" })).toBeVisible();
  });

  test("Escape clears the query", async ({ page }) => {
    const search = page.getByRole("searchbox", { name: "Search content" });
    await search.fill("mars");
    await expect(page).toHaveURL("/search");
    await search.press("Escape");
    await expect(search).toHaveValue("");
    await expect(page.getByText("Type at least 2 characters")).toBeVisible();
  });
});
