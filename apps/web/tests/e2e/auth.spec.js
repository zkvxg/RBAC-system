import { test, expect } from "@playwright/test";
import { loginAs } from "./pages/LoginPage";

test("login as admin", async ({ page }) => {
  await loginAs(page, "admin");
  await expect(page.getByText("RBAC System", { exact: false })).toBeVisible();
});
