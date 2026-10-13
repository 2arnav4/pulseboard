import { expect, test } from "@playwright/test";
import { signUpNewUser } from "./helpers";

test.describe("authentication", () => {
  test("redirects signed-out visitors to the login page and back after sign-in", async ({ page }) => {
    await page.goto("/favorites");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Ffavorites/);
    await page.getByLabel("Email").fill("demo@pulseboard.app");
    await page.getByLabel("Password").fill("pulseboard-demo");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL("/favorites");
    await expect(page.getByRole("heading", { name: "Favorites", level: 1 })).toBeVisible();
  });

  test("rejects a wrong password with an error message", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("demo@pulseboard.app");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Incorrect email or password.");
    await expect(page).toHaveURL(/\/login/);
  });

  test("signs up, signs out, and signs back in", async ({ page }) => {
    const { email, password } = await signUpNewUser(page, "Ada Lovelace");
    await page.getByRole("button", { name: "Account menu" }).click();
    await expect(page.getByText(email)).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: "Account menu" })).toContainText("Ada Lovelace");
  });

  test("refuses to register the same email twice", async ({ page, request }) => {
    const { email } = await signUpNewUser(page);
    const response = await request.post("/api/register", { data: { name: "Copy", email, password: "another-password" } });
    expect(response.status()).toBe(409);
  });

  test("blocks data APIs for anonymous requests", async ({ request }) => {
    const response = await request.get("/api/feed");
    expect(response.status()).toBe(401);
  });

  test("updates the profile and reflects it in the header", async ({ page }) => {
    await signUpNewUser(page, "Old Name");
    await page.goto("/profile");
    await page.getByLabel("Display name").fill("New Name");
    await page.getByLabel("Bio").fill("Frontend engineer");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Profile saved." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Account menu" })).toContainText("New Name");
  });
});
