import { test, expect } from "@playwright/test";
import { loginAs } from "./pages/LoginPage";

test("login as admin", async ({ page }) => {
  await loginAs(page, "admin");
  await expect(page.getByText("RBAC System", { exact: false })).toBeVisible();
});

test("demo account buttons fill in the form", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Fill in Manager credentials" })
    .click();

  await expect(page.getByLabel("Email")).toHaveValue("manager@test.com");
  await expect(page.getByPlaceholder("Enter your password")).toHaveValue(
    "test123",
  );

  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("demo credentials can be copied", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "clipboard permissions are chromium-only",
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/login");

  await page.getByRole("button", { name: "Copy admin@test.com" }).click();

  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "admin@test.com",
  );
});
