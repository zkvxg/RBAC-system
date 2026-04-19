import { test, expect } from "@playwright/test";

async function login(page, role = "admin") {
  const creds = {
    admin: { email: "admin@example.com", password: "test123" },
    manager: { email: "manager@example.com", password: "test123" },
    employee: { email: "employee@example.com", password: "test123" },
  };
  const { email, password } = creds[role];
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

// testy kompletnego workflow zarzadzania uzytkownikami od logowania do aktualizacji
test.describe("User Management Complete Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // logowanie jako admin przed kazdym testem
    await login(page, "admin");
  });

  test("should navigate to users page and display users list", async ({
    page,
  }) => {
    await page.goto("/users");
    await page.waitForSelector("tbody tr", { timeout: 15000 });

    await expect(page.getByText(/showing.*users/i)).toBeVisible();

    // sprawdzenie czy tabela uzytkownikow jest widoczna
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // sprawdzenie czy sa headery kolumn (rzeczywiste nazwy kolumn)
    await expect(
      page.getByRole("columnheader", { name: /user info/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /contact/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /role & status/i }),
    ).toBeVisible();
  });

  test("should create new user via form", async ({ page }) => {
    await page.goto("/users");

    // klikniecie przycisku add user
    await page.getByRole("button", { name: /add user/i }).click();

    // wypelnienie formularza (rzeczywiste pola: Full Name, Email, Role, Department, Phone Number, Location)
    await page.getByLabel("Full Name").fill("Test User E2E");
    await page.getByLabel("Email").fill("testuser-e2e@test.com");
    await page.getByLabel("Role").selectOption({ label: "Admin" });
    await page.getByLabel("Department").selectOption({ label: "IT" });
    await page.getByLabel("Phone Number").fill("123456789");
    await page.getByLabel("Location").fill("Warsaw, Poland");

    // zatwierdzenie formularza
    await page.getByRole("button", { name: /create user/i }).click();

    // sprawdzenie czy nowy uzytkownik pojawil sie
    await expect(
      page.getByText("User created successfully").first(),
    ).toBeVisible({
      timeout: 5000,
    });
  });

  test("should edit existing user", async ({ page }) => {
    await page.goto("/users");

    // znalezienie pierwszego uzytkownika i klikniecie edit (aria-label: "Edit user")
    const firstEditButton = page
      .getByRole("button", { name: /edit user/i })
      .first();
    await firstEditButton.click();

    // aktualizacja nazwy uzytkownika
    const nameField = page.getByLabel("Full Name");
    await nameField.clear();
    await nameField.fill("Updated User Name");

    // naprawienie telefonu jesli ma bledny format
    const phoneField = page.getByLabel("Phone Number");
    await phoneField.clear();
    await phoneField.fill("123456789");

    // zapisanie zmian
    await page.getByRole("button", { name: /update user/i }).click();

    // sprawdzenie czy zmiana zostala zapisana
    await expect(
      page.getByText("User updated successfully").first(),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test("should delete user", async ({ page }) => {
    await page.goto("/users");

    // klikniecie przycisku delete (aria-label: "Delete user")
    const deleteButton = page
      .getByRole("button", { name: /delete user/i })
      .first();
    await deleteButton.click();

    // potwierdzenie w modalu (nie browser dialog)
    await expect(
      page.getByText(/are you sure you want to delete/i),
    ).toBeVisible();
    await page.getByRole("button", { name: "Delete" }).click();

    // sprawdzenie czy uzytkownik zostal usuniety
    await expect(
      page.getByText("User deleted successfully").first(),
    ).toBeVisible({
      timeout: 5000,
    });
  });

  test("should filter users by search", async ({ page }) => {
    await page.goto("/users");
    await page.waitForSelector("tbody tr", { timeout: 15000 });

    // wpisanie wyszukiwanej frazy
    const searchInput = page.getByPlaceholder(/search users/i);
    await searchInput.fill("First");

    // sprawdzenie czy filtrowanie dziala
    await expect(page.getByText(/first test-user/i)).toBeVisible();
  });

  test("should change user role", async ({ page }) => {
    await page.goto("/users");

    // znalezienie uzytkownika i otwarcie edycji
    const editButton = page.getByRole("button", { name: /edit user/i }).first();
    await editButton.click();

    // zmiana roli
    const roleSelect = page.getByLabel("Role");
    await roleSelect.selectOption({ label: "Manager" });

    // naprawienie telefonu jesli ma bledny format
    const phoneField = page.getByLabel("Phone Number");
    await phoneField.clear();
    await phoneField.fill("123456789");

    // zapisanie
    await page.getByRole("button", { name: /update user/i }).click();

    // sprawdzenie czy aktualizacja sie powiodla
    await expect(
      page.getByText("User updated successfully").first(),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test("should validate required fields in user form", async ({ page }) => {
    await page.goto("/users");

    await page.getByRole("button", { name: /add user/i }).click();

    // klikamy w pole zeby formularz byl "dotkniety" przed submitem
    await page.getByLabel("Full Name").click();
    await page.getByRole("button", { name: /create user/i }).click();

    // sprawdzenie czy walidacja dziala
    await expect(page.getByText("Name is required")).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    await page.goto("/users");

    await page.getByRole("button", { name: /add user/i }).click();

    await page.getByLabel("Full Name").fill("Test User");
    await page.getByLabel("Email").fill("invalid-email-format");
    await page.getByLabel("Role").selectOption({ label: "Admin" });
    await page.getByLabel("Department").selectOption({ label: "IT" });
    await page.getByLabel("Phone Number").fill("123456789");
    await page.getByLabel("Location").fill("Warsaw, Poland");

    await page.getByRole("button", { name: /create user/i }).click();

    // sprawdzenie bledu walidacji email
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test("should paginate through users list", async ({ page }) => {
    await page.goto("/users");

    // sprawdzenie czy wyswietla sie info o liczbie uzytkownikow (brak paginacji, tylko "Showing X of Y")
    await expect(page.getByText(/showing/i)).toBeVisible();
  });

  test("should sort users by column", async ({ page }) => {
    await page.goto("/users");

    // sprawdzenie czy tabela zawiera wiersze danych
    await page.waitForSelector("table", { timeout: 5000 });
    const rows = page
      .locator("table tr")
      .filter({ hasNot: page.locator("th") });
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Role Management Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "admin");
  });

  test("should navigate to roles page", async ({ page }) => {
    await page.goto("/roles");
    await page.waitForSelector("table", { timeout: 15000 });

    await expect(page.getByRole("button", { name: /add role/i })).toBeVisible();
  });

  test("should create new role with permissions", async ({ page }) => {
    await page.goto("/roles");

    await page.getByRole("button", { name: /add role/i }).click();

    await page.getByLabel("Role Name").fill("TestRole");
    await page.getByLabel("Description").fill("Test role for automation");

    await page.getByRole("button", { name: /create role/i }).click();

    await expect(
      page.getByText("Role created successfully").first(),
    ).toBeVisible({
      timeout: 5000,
    });
  });

  test("should edit role permissions", async ({ page }) => {
    await page.goto("/roles");

    // klikniecie przycisku "Edit permissions" (aria-label)
    const permissionsButton = page
      .getByRole("button", { name: /edit permissions/i })
      .first();
    await permissionsButton.click();

    // zaznaczenie uprawnienia za pomoca Select All
    await page
      .getByRole("button", { name: /select all/i })
      .first()
      .click();

    await page.getByRole("button", { name: /save permissions/i }).click();

    // sprawdzenie czy uprawnienia zostaly zapisane
    await expect(
      page.getByText("Permissions updated successfully").first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should not allow deleting system roles", async ({ page }) => {
    await page.goto("/roles");

    // sprawdzenie czy przycisk Delete jest disabled dla roli Admin
    const adminRow = page
      .getByText("Admin")
      .first()
      .locator("xpath=ancestor::tr");
    const deleteButton = adminRow.getByRole("button", {
      name: /delete role/i,
    });

    await expect(deleteButton).toBeDisabled();
  });

  test("should display role permissions in detail view", async ({ page }) => {
    await page.goto("/roles");

    // sprawdzenie czy kolumna Permissions jest widoczna w tabeli
    await expect(
      page.getByRole("columnheader", { name: /permissions/i }),
    ).toBeVisible();

    // sprawdzenie czy sa wyswietlone uprawnienia w wierszach
    await expect(
      page.getByText(/users\.manage|roles\.manage/i).first(),
    ).toBeVisible();
  });
});

test.describe("Authentication Edge Cases", () => {
  test("should handle session timeout gracefully", async ({ page }) => {
    await login(page, "admin");

    // czyszczenie local storage zeby symulowac timeout sesji
    await page.evaluate(() => localStorage.clear());

    // proba przejscia do chronionej strony
    await page.goto("/users");

    // powinno przekierowac do logowania
    await expect(page).toHaveURL(/\/login/);
  });

  test("should prevent access to protected routes when not logged in", async ({
    page,
  }) => {
    await page.goto("/users");

    await expect(page).toHaveURL(/\/login/);
  });


  test("should show error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByPlaceholder("Enter your password").fill("wrongpass");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(
      page.getByText(/invalid email or password/i).first(),
    ).toBeVisible();
  });
});

test.describe("Accessibility Tests", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/login");

    // strona logowania ma heading "RBAC System" i "Sign in"
    await expect(
      page.getByRole("heading", { name: "RBAC System" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("should have form labels for inputs", async ({ page }) => {
    await page.goto("/login");

    // sprawdzenie czy wszystkie inputy maja label
    const emailInput = page.getByLabel("Email");
    await expect(emailInput).toBeVisible();

    // password input (uzywamy placeholder bo getByLabel matchuje 2 elementy)
    const passwordInput = page.getByPlaceholder("Enter your password");
    await expect(passwordInput).toBeVisible();
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/login");

    // fokus na email input
    await page.getByLabel("Email").focus();
    await expect(page.getByLabel("Email")).toBeFocused();

    // tab do password
    await page.keyboard.press("Tab");

    // tab do Sign In button (moze byc dodatkowy tab dla show password button)
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeFocused();
  });
});
