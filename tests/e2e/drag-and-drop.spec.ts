import { expect, test } from "@playwright/test";
import { feedItemIds, signUpNewUser } from "./helpers";

test.describe("drag-and-drop reordering", () => {
  test.beforeEach(async ({ page }) => {
    await signUpNewUser(page);
    await page.goto("/");
    await expect(page.getByTestId("feed-item").first()).toBeVisible();
  });

  test("dragging a card by its handle reorders the feed and the order survives a reload", async ({ page }) => {
    const before = await feedItemIds(page);
    const firstHandle = page.getByTestId("drag-handle").first();
    const thirdItem = page.getByTestId("feed-item").nth(2);

    const handleBox = await firstHandle.boundingBox();
    const targetBox = await thirdItem.boundingBox();
    if (!handleBox || !targetBox) throw new Error("feed not laid out");

    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox.x + handleBox.width / 2, targetBox.y + targetBox.height * 0.75, { steps: 25 });
    await page.mouse.up();

    await expect.poll(async () => (await feedItemIds(page))[0]).not.toBe(before[0]);
    const after = await feedItemIds(page);
    expect(after.indexOf(before[0])).toBeGreaterThan(0);

    await page.reload();
    await expect(page.getByTestId("feed-item").first()).toBeVisible();
    await expect.poll(async () => (await feedItemIds(page)).slice(0, 4)).toEqual(after.slice(0, 4));
  });

  test("keyboard move buttons reorder and can be reset", async ({ page }) => {
    const before = await feedItemIds(page);
    const firstCard = page.getByTestId("feed-item").first();
    await firstCard.getByRole("button", { name: /^Move “.*” down$/ }).focus();
    await page.keyboard.press("Enter");

    await expect.poll(async () => (await feedItemIds(page)).slice(0, 2)).toEqual([before[1], before[0]]);
    await expect(page.getByText(/Moved “.*” to position 2\./)).toBeAttached();

    await page.getByRole("button", { name: "Reset order" }).click();
    await expect.poll(async () => (await feedItemIds(page)).slice(0, 2)).toEqual(before.slice(0, 2));
  });
});
