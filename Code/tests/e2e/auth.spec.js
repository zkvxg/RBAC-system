import { test, expect } from "@playwright/test";

const credentials = {
  admin: { email: "admin@example.com", password: "test123" },
  manager: { email: "manager@example.com", password: "test123" },
  employee: { email: "employee@example.com", password: "test123" },
};

async function login(page, role = "admin") {
  const { email, password } = credentials[role];
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

// test logowania jako admin i wyswietlenia dashboardu
test("login as admin", async ({ page }) => {
  await login(page, "admin");
  await expect(page.getByText("RBAC System", { exact: false })).toBeVisible();
});
