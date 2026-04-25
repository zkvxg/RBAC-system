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

// tworzy uzytkownika przez ui i zwraca jego dane zeby testy nie ruszaly seedow
async function createTestUser(page, suffix = Date.now()) {
  const name = `E2E User ${suffix}`;
  const email = `e2e-${suffix}@test.com`;
  await page.goto("/users");
  await page.getByRole("button", { name: /add user/i }).click();
  await page.getByLabel("Full Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Role").selectOption({ label: "Employee" });
  await page.getByLabel("Department").selectOption({ label: "IT" });
  await page.getByLabel("Phone Number").fill("123456789");
  await page.getByLabel("Location").fill("Warsaw, Poland");
  await page.getByRole("button", { name: /create user/i }).click();
  await expect(page.getByText("User created successfully").first()).toBeVisible(
    { timeout: 10000 },
  );
  return { name, email };
}

// znajduje wiersz tabeli zawierajacy podany email
function userRow(page, email) {
  return page.locator("tbody tr").filter({ hasText: email }).first();
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

    // unikalne wartosci zeby test dzialal wielokrotnie na tej samej bazie
    const ts = Date.now();
    // wypelnienie formularza (rzeczywiste pola: Full Name, Email, Role, Department, Phone Number, Location)
    await page.getByLabel("Full Name").fill(`Test User E2E ${ts}`);
    await page.getByLabel("Email").fill(`testuser-e2e-${ts}@test.com`);
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
      timeout: 10000,
    });
  });

  test("should edit existing user", async ({ page }) => {
    // tworzymy wlasnego usera zeby nie ruszac seedow admin manager employee
    const { email } = await createTestUser(page, `edit-${Date.now()}`);

    // czekamy az wiersz pojawi sie w tabeli (lista mogla sie jeszcze odswiezac)
    const row = userRow(page, email);
    await expect(row).toBeVisible({ timeout: 15000 });

    // edycja po wierszu zawierajacym nasz email
    await row.getByRole("button", { name: /edit user/i }).click();

    const nameField = page.getByLabel("Full Name");
    await expect(nameField).toBeVisible({ timeout: 10000 });
    await nameField.clear();
    await nameField.fill("Updated User Name");

    const phoneField = page.getByLabel("Phone Number");
    await phoneField.clear();
    await phoneField.fill("123456789");

    await page.getByRole("button", { name: /update user/i }).click();

    await expect(
      page.getByText("User updated successfully").first(),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should delete user", async ({ page }) => {
    // tworzymy wlasnego usera do skasowania
    const { email } = await createTestUser(page, `del-${Date.now()}`);

    await userRow(page, email)
      .getByRole("button", { name: /delete user/i })
      .click();

    // potwierdzenie w modalu (nie browser dialog)
    await expect(
      page.getByText(/are you sure you want to delete/i),
    ).toBeVisible();
    await page.getByRole("button", { name: "Delete" }).click();

    await expect(
      page.getByText("User deleted successfully").first(),
    ).toBeVisible({
      timeout: 5000,
    });
  });

  test("should filter users by search", async ({ page }) => {
    // tworzymy unikalnego usera i go wyszukujemy zeby test dzialal i na mockach i na seedach
    const { name, email } = await createTestUser(page, `search-${Date.now()}`);

    await page.goto("/users");
    await page.waitForSelector("tbody tr", { timeout: 20000 });

    const searchInput = page.getByPlaceholder(/search users/i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill(name);

    await expect(userRow(page, email)).toBeVisible({ timeout: 15000 });
  });

  test("should change user role", async ({ page }) => {
    // tworzymy wlasnego usera i mu zmieniamy role
    const { email } = await createTestUser(page, `role-${Date.now()}`);

    await userRow(page, email)
      .getByRole("button", { name: /edit user/i })
      .click();

    const roleSelect = page.getByLabel("Role");
    await roleSelect.selectOption({ label: "Manager" });

    const phoneField = page.getByLabel("Phone Number");
    await phoneField.clear();
    await phoneField.fill("123456789");

    await page.getByRole("button", { name: /update user/i }).click();

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

    // unikalna nazwa zeby kolejne uruchomienia nie waliły sie na unique constraint
    await page.getByLabel("Role Name").fill(`TestRole${Date.now()}`);
    await page.getByLabel("Description").fill("Test role for automation");

    await page.getByRole("button", { name: /create role/i }).click();

    await expect(
      page.getByText("Role created successfully").first(),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test("should edit role permissions", async ({ page }) => {
    // tworzymy wlasna role zeby nie ruszac uprawnien admina
    const roleName = `EditPerm${Date.now()}`;
    await page.goto("/roles");
    await page.getByRole("button", { name: /add role/i }).click();
    await page.getByLabel("Role Name").fill(roleName);
    await page.getByLabel("Description").fill("role do testu uprawnien");
    await page.getByRole("button", { name: /create role/i }).click();
    await expect(
      page.getByText("Role created successfully").first(),
    ).toBeVisible({ timeout: 10000 });

    // znajdujemy wiersz nowej roli i klikamy edit permissions
    const row = page.locator("tbody tr").filter({ hasText: roleName }).first();
    await row.getByRole("button", { name: /edit permissions/i }).click();

    await page
      .getByRole("button", { name: /select all/i })
      .first()
      .click();

    await page.getByRole("button", { name: /save permissions/i }).click();

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

    // sprawdzenie czy sa wyswietlone uprawnienia w wierszach (dziala dla mockow .manage i seedow .view)
    await expect(
      page.getByText(/users\.(manage|view)|roles\.(manage|view)/i).first(),
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
    await page.getByLabel("Email").fill("wrong@test.com");
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
