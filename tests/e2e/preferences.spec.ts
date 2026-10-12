import { expect, test } from "@playwright/test";
import { signUpNewUser } from "./helpers";

test.describe("preferences", () => {
  test.beforeEach(async ({ page }) => {
    await signUpNewUser(page);
  });

  test("dark mode toggles the theme and persists across reloads", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
    await page.getByTestId("theme-toggle").click();
    await expect(html).toHaveClass(/dark/);
    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });

  test("category choices personalize the feed and persist", async ({ page }) => {
    await page.getByText("Science", { exact: true }).click();
    await page.getByText("Business", { exact: true }).click();
    await page.getByRole("link", { name: "My Feed" }).first().click();
    await expect(page.getByText(/Personalized for Technology, Sports, Science/)).toBeVisible();
    await page.reload();
    await expect(page.getByText(/Personalized for Technology, Sports, Science/)).toBeVisible();
  });

  test("keeps at least one category selected", async ({ page }) => {
    await page.getByText("Business", { exact: true }).click();
    await page.getByText("Sports", { exact: true }).click();
    await expect(page.getByRole("checkbox", { name: "Technology" })).toBeDisabled();
  });

  test("switching language translates the interface and sets the lang attribute", async ({ page }) => {
    await page.getByLabel("Language").first().selectOption("hi");
    await expect(page.getByRole("heading", { name: "सेटिंग्स", level: 1 })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");
    await page.getByLabel("भाषा").first().selectOption("es");
    await expect(page.getByRole("heading", { name: "Ajustes", level: 1 })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Ajustes", level: 1 })).toBeVisible();
  });
});
