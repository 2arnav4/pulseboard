import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

test("mobile layout uses a drawer for navigation", async ({ page }) => {
  await loginAsDemo(page);
  const openMenu = page.getByRole("button", { name: "Open menu" });
  await expect(openMenu).toBeVisible();
  await openMenu.click();
  const drawer = page.getByRole("dialog", { name: "Main navigation" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("link", { name: "Trending" }).click();
  await expect(page).toHaveURL("/trending");
  await expect(drawer).toBeHidden();
});
