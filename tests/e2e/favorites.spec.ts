import { expect, test } from "@playwright/test";
import { signUpNewUser } from "./helpers";

test("favoriting a card adds it to Favorites and un-favoriting removes it", async ({ page }) => {
  await signUpNewUser(page);
  await page.goto("/");
  const firstCard = page.getByTestId("content-card").first();
  const title = (await firstCard.getByRole("heading").textContent()) ?? "";
  await firstCard.getByRole("button", { name: /to favorites$/ }).click();
  await expect(firstCard.getByRole("button", { name: /from favorites$/ })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("link", { name: /Favorites/ }).first().click();
  await expect(page).toHaveURL("/favorites");
  const favorite = page.getByTestId("content-card").filter({ hasText: title });
  await expect(favorite).toBeVisible();

  await page.reload();
  await expect(favorite).toBeVisible();

  await favorite.getByRole("button", { name: /from favorites$/ }).click();
  await expect(page.getByRole("heading", { name: "No favorites yet" })).toBeVisible();
});
