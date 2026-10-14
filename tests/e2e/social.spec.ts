import { expect, test } from "@playwright/test";
import { signUpNewUser } from "./helpers";

test("write a post with an emoji, react to it, and keep both after a reload", async ({ page }) => {
  await signUpNewUser(page, "Ana Lee");
  await page.goto("/");

  const box = page.getByRole("textbox", { name: "Write a post" });
  await box.fill("Testing Pulseboard #e2e ");
  // The picker loads its data from our own /api/emojibase route, not a CDN.
  const emojiData = page.waitForResponse((response) => response.url().includes("/api/emojibase/en/data.json") && response.ok());
  await page.getByRole("button", { name: "Add emoji" }).click();
  await emojiData;
  await page.getByRole("dialog", { name: "Add emoji" }).getByText("😀", { exact: true }).click();
  await expect(box).toHaveValue("Testing Pulseboard #e2e 😀");
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(box).toHaveValue("");

  const justIn = page.getByRole("list", { name: "Just in" });
  const post = justIn.getByTestId("content-card").filter({ hasText: "Testing Pulseboard" });
  await expect(post).toBeVisible();
  await expect(post.getByText("You", { exact: true })).toBeVisible();

  await post.getByRole("button", { name: /^Add a reaction/ }).click();
  await post.getByRole("button", { name: "React with 🔥" }).click();
  await expect(post.getByRole("button", { name: "🔥 1 reaction" })).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await expect(post).toBeVisible();
  await expect(post.getByRole("button", { name: "🔥 1 reaction" })).toBeVisible();

  await post.getByRole("button", { name: "Search #e2e" }).click();
  await expect(page).toHaveURL("/search");
  await expect(page.getByRole("searchbox", { name: "Search content" })).toHaveValue("e2e");

  await page.goto("/");
  await post.getByRole("button", { name: /^Delete your post/ }).click();
  await expect(post).toHaveCount(0);
});

test("the emoji data route requires a session and rejects unknown files", async ({ request, page }) => {
  expect((await request.get("/api/emojibase/en/data.json")).status()).toBe(401);
  await signUpNewUser(page);
  expect((await page.request.get("/api/emojibase/xx/data.json")).status()).toBe(404);
  const response = await page.request.get("/api/emojibase/hi/messages.json");
  expect(response.ok()).toBe(true);
  expect(response.headers()["etag"]).toContain("emojibase-");
});
