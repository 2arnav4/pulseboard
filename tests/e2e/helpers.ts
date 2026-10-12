import { expect, type Page } from "@playwright/test";

/** Signs in with the seeded demo account and waits for the feed to render. */
export async function loginAsDemo(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Continue with the demo account" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByTestId("feed-item").first()).toBeVisible();
}

/** Creates a fresh account (unique email) so tests do not share persisted state. */
export async function signUpNewUser(page: Page, name = "Test User") {
  const email = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const password = "correct-horse-battery";
  await page.goto("/signup");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL("/settings");
  return { email, password };
}

export async function feedItemIds(page: Page): Promise<string[]> {
  return page.getByTestId("feed-item").locator("[data-item-id]").evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-item-id") ?? ""),
  );
}
