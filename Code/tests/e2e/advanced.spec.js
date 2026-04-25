import { test, expect } from "@playwright/test";

async function login(page, role = "admin") {
  const creds = {
    admin: { email: "admin@test.com", password: "test123" },
    manager: { email: "manager@test.com", password: "test123" },
    employee: { email: "employee@test.com", password: "test123" },
  };
  const { email, password } = creds[role];
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  // wiekszy timeout zeby firefox/webkit zdazyly z realnym backendem
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20000 });
}

// test walidacji formularza uzytkownika i tworzenia nowego uzytkownika
test("user form validation and create user", async ({ page }) => {
  await login(page, "admin");
  await page.getByRole("link", { name: "Users" }).click();

  await page.getByRole("button", { name: /add user/i }).click();
  // wyłączamy HTML5 walidację żeby JS walidacja zadziałała
  await page.evaluate(() => {
    document.querySelector("form")?.setAttribute("novalidate", "");
  });
  await page.getByLabel("Full Name").click();
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

// test sprawdzajacy ze employee nie widzi opcji tylko dla admina
test("employee cannot see admin-only navigation", async ({ page }) => {
  await login(page, "employee");

  await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Roles" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Departments" })).toHaveCount(0);

  // sprawdzenie ze bezposrednie wejscie na chronione trasy przekierowuje na dashboard
  await page.goto("/users");
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/roles");
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/departments");
  await expect(page).toHaveURL(/\/dashboard$/);
});
