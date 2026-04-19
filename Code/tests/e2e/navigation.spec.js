import { test, expect } from "@playwright/test";

async function loginAsAdmin(page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByPlaceholder("Enter your password").fill("test123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

// test nawigacji do strony users i wyswietlenia przycisku add user
test("users page shows Add User", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("link", { name: "Users" }).click();
  await expect(page.getByRole("button", { name: /add user/i })).toBeVisible();
});

// test nawigacji do strony roles i wyswietlenia przycisku add role
test("roles page shows Add Role", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("link", { name: "Roles" }).click();
  await expect(page.getByRole("button", { name: /add role/i })).toBeVisible();
});

// test nawigacji do strony departments i wyswietlenia przycisku add department
test("departments page shows Add Department", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("link", { name: "Departments" }).click();
  await expect(
    page.getByRole("button", { name: /add department/i }),
  ).toBeVisible();
});
