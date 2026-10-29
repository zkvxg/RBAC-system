import { test, expect } from "@playwright/test";
import { loginAs } from "./pages/LoginPage";

test("user form validation and create user", async ({ page }) => {
  await loginAs(page, "admin");
  await page.getByRole("link", { name: "Users" }).click();

  await page.getByRole("button", { name: /add user/i }).click();
  await page.getByRole("button", { name: /create user/i }).click();

  await expect(page.getByText("Name is required")).toBeVisible();
  await expect(page.getByText("Email is required")).toBeVisible();
  await expect(page.getByText("Department is required")).toBeVisible();
  await expect(page.getByText("Location is required")).toBeVisible();

  const uniqueName = `E2E User ${Date.now()}`;
  await page.getByLabel("Full Name").fill(uniqueName);
  await page.getByLabel("Email").fill(`e2e+${Date.now()}@test.com`);
  await page.getByLabel("Role").selectOption({ label: "Admin" });
  await page.getByLabel("Department").selectOption({ label: "IT" });
  await page.getByLabel("Phone Number").fill("123456789");
  await page.getByLabel("Location").fill("Warsaw, Poland");

  await page.getByRole("button", { name: /create user/i }).click();
  await expect(
    page.getByText("User created successfully").first(),
  ).toBeVisible();

  await page.getByPlaceholder("Search users...").fill(uniqueName);
  await expect(page.getByText(uniqueName)).toBeVisible();
});

test("employee cannot see admin-only navigation", async ({ page }) => {
  await loginAs(page, "employee");

  await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Roles" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Departments" })).toHaveCount(0);

  await page.goto("/users");
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/roles");
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/departments");
  await expect(page).toHaveURL(/\/dashboard$/);
});
