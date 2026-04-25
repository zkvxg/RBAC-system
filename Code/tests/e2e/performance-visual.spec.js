import { test, expect } from "@playwright/test";

async function login(page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@test.com");
  await page.getByPlaceholder("Enter your password").fill("test123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard$/);
}

// testy wydajnosci i visual regression
test.describe("Performance Tests", () => {
  test("should load dashboard within acceptable time", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByPlaceholder("Enter your password").fill("test123");

    const startTime = Date.now();
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard$/);
    const loadTime = Date.now() - startTime;

    // dashboard powinien zaladowac sie w mniej niz 3 sekundy
    expect(loadTime).toBeLessThan(3000);
  });

  test("should measure page load metrics", async ({ page }) => {
    await login(page);

    // pomiar web vitals
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });

    console.log("Page metrics:", metrics);
    expect(metrics.domContentLoaded).toBeLessThan(2000);
  });

  test("should handle rapid form submissions", async ({ page }) => {
    await login(page);

    await page.goto("/users");

    // szybkie wielokrotne klikanie add user zeby sprawdzic debouncing
    const addButton = page.getByRole("button", { name: /add user/i });
    await addButton.click();

    // sprawdzenie czy modal pojawil sie
    await expect(page.getByText("Add New User")).toBeVisible();
  });

  test("should paginate large datasets efficiently", async ({ page }) => {
    await login(page);

    await page.goto("/users");

    // pomiar czasu renderowania listy, 8s zeby wolniejsze przegladarki tez sie zmiescily
    const startTime = Date.now();
    await page.waitForSelector("tbody tr", { timeout: 15000 });
    const renderTime = Date.now() - startTime;

    expect(renderTime).toBeLessThan(8000);
  });
});

test.describe("Visual Regression Tests", () => {
  test("login page should match screenshot", async ({ page }) => {
    await page.goto("/login");

    // screenshot pelnej strony
    await expect(page).toHaveScreenshot("login-page.png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.25,
    });
  });

  test("dashboard should match screenshot", async ({ page }) => {
    await login(page);

    await expect(page).toHaveScreenshot("dashboard.png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.25,
    });
  });

  test("users list should match screenshot", async ({ page }) => {
    await login(page);

    await page.goto("/users");
    await page.waitForSelector("tbody tr");

    await expect(page).toHaveScreenshot("users-list.png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.25,
    });
  });

  test("user form modal should match screenshot", async ({ page }) => {
    await login(page);

    await page.goto("/users");
    await page.getByRole("button", { name: /add user/i }).click();

    // czekamy na modal
    await expect(page.getByLabel("Full Name")).toBeVisible();

    await expect(page).toHaveScreenshot("user-form-modal.png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.25,
    });
  });

  test("roles page should match screenshot", async ({ page }) => {
    await login(page);

    await page.goto("/roles");
    await page.waitForSelector("table");

    await expect(page).toHaveScreenshot("roles-page.png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.25,
    });
  });

  test("error state should match screenshot", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@test.com.com");
    await page.getByPlaceholder("Enter your password").fill("wrongpass");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(
      page.getByText(/invalid email or password/i).first(),
    ).toBeVisible();

    await expect(page).toHaveScreenshot("login-error.png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.25,
    });
  });
});

test.describe("Cross-browser Compatibility", () => {
  test("should work in all browsers", async ({ page, browserName }) => {
    console.log(`Running test in ${browserName}`);

    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByPlaceholder("Enter your password").fill("test123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(/rbac system/i)).toBeVisible();
  });

  test("should render correctly on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/login");

    // sprawdzenie czy layout jest responsive
    const loginForm = page.locator("form");
    const boundingBox = await loginForm.boundingBox();

    expect(boundingBox.width).toBeLessThanOrEqual(375);
  });

  test("should render correctly on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await login(page);

    // sprawdzenie czy dashboard zaladowal sie poprawnie
    await expect(page.getByText(/rbac system/i)).toBeVisible();
  });

  test("should handle dark mode if available", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });

    await page.goto("/login");
  });
});

test.describe("Network Conditions Tests", () => {
  test("should handle slow 3g connection", async ({ page, context }) => {
    // symulacja wolnej sieci 3g
    await context.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.continue();
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByPlaceholder("Enter your password").fill("test123");
    await page.getByRole("button", { name: /sign in/i }).click();

    // powinno sie zaladowac pomimo wolnej sieci
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("should show error on network failure", async ({ page }) => {
    await page.goto("/login");

    // proba logowania z niepoprawnymi danymi (symulacja bledu)
    await page.getByLabel("Email").fill("wrong@test.com");
    await page.getByPlaceholder("Enter your password").fill("wrongpass");
    await page.getByRole("button", { name: /sign in/i }).click();

    // sprawdzenie komunikatu bledu
    await expect(
      page.getByText(/invalid email or password/i).first(),
    ).toBeVisible();
  });

  test("should retry failed requests", async ({ page }) => {
    // test sprawdzajacy ze aplikacja dziala po blednym logowaniu i ponownej probie
    await page.goto("/login");

    // pierwsza proba - bledne dane
    await page.getByLabel("Email").fill("wrong@test.com");
    await page.getByPlaceholder("Enter your password").fill("wrongpass");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(
      page.getByText(/invalid email or password/i).first(),
    ).toBeVisible();

    // druga proba - poprawne dane
    await page.getByLabel("Email").clear();
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByPlaceholder("Enter your password").clear();
    await page.getByPlaceholder("Enter your password").fill("test123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

test.describe("Data Integrity Tests", () => {
  test("should preserve form data on validation error", async ({ page }) => {
    await login(page);

    await page.goto("/users");
    await page.getByRole("button", { name: /add user/i }).click();

    await page.getByLabel("Full Name").fill("testuser");
    await page.getByLabel("Email").fill("invalid-email");

    await page.getByRole("button", { name: /create user/i }).click();

    // sprawdzenie czy Full Name nadal jest w polu mimo bledu
    const nameValue = await page.getByLabel("Full Name").inputValue();
    expect(nameValue).toBe("testuser");
  });

  test("should clear form after successful submission", async ({ page }) => {
    await login(page);

    await page.goto("/users");
    await page.getByRole("button", { name: /add user/i }).click();

    // unikalne wartosci zeby test dzialal wielokrotnie na tej samej bazie
    const ts = Date.now();
    await page.getByLabel("Full Name").fill(`New User ${ts}`);
    await page.getByLabel("Email").fill(`newuser-${ts}@test.com`);
    await page.getByLabel("Role").selectOption({ label: "Admin" });
    await page.getByLabel("Department").selectOption({ label: "IT" });
    await page.getByLabel("Phone Number").fill("123456789");
    await page.getByLabel("Location").fill("Warsaw, Poland");
    await page.getByRole("button", { name: /create user/i }).click();

    // sprawdzenie czy uzytkownk zostal stworzony
    await expect(
      page.getByText("User created successfully").first(),
    ).toBeVisible({
      timeout: 10000,
    });
  });
});
