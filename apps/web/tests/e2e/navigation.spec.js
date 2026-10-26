import { test, expect } from "@playwright/test";
import { loginAs } from "./pages/LoginPage";

test("users page shows Add User", async ({ page }) => {
  await loginAs(page);
  await page.getByRole("link", { name: "Users" }).click();
  await expect(page.getByRole("button", { name: /add user/i })).toBeVisible();
});

test("roles page shows Add Role", async ({ page }) => {
  await loginAs(page);
  await page.getByRole("link", { name: "Roles" }).click();
  await expect(page.getByRole("button", { name: /add role/i })).toBeVisible();
});

test("departments page shows Add Department", async ({ page }) => {
  await loginAs(page);
  await page.getByRole("link", { name: "Departments" }).click();
  await expect(
    page.getByRole("button", { name: /add department/i }),
  ).toBeVisible();
});
