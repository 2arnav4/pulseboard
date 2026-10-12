import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

test("real-time posts arrive over SSE and appear after clicking the pill", async ({ page }) => {
  await loginAsDemo(page);
  await expect(page.getByText("Live", { exact: true })).toBeVisible();
  const pill = page.getByTestId("new-posts-pill");
  await expect(pill).toBeVisible({ timeout: 15_000 });
  await pill.click();
  await expect(page.getByRole("list", { name: "Just in" }).getByTestId("content-card")).not.toHaveCount(0);
});

test("trending tabs switch between news, movies and posts", async ({ page }) => {
  await loginAsDemo(page);
  await page.getByRole("link", { name: "Trending" }).first().click();
  await expect(page.getByRole("tab", { name: "News" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Movies" }).click();
  await expect(page.getByRole("tabpanel").getByText("Movie").first()).toBeVisible();
  await page.getByRole("tab", { name: "Movies" }).press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Posts" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: "Posts" })).toBeFocused();
});
