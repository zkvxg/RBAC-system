import { expect } from "@playwright/test";

export const CREDENTIALS = {
  admin: { email: "admin@test.com", password: "test123" },
  manager: { email: "manager@test.com", password: "test123" },
  employee: { email: "employee@test.com", password: "test123" },
};

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.email = page.getByLabel("Email");
    this.password = page.getByPlaceholder("Enter your password");
    this.submit = page.getByRole("button", { name: /sign in/i });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async signIn(email, password) {
    await this.goto();
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  async signInAs(role = "admin") {
    const { email, password } = CREDENTIALS[role];
    await this.signIn(email, password);
    await expect(this.page).toHaveURL(/\/dashboard$/, { timeout: 20000 });
  }
}

export const loginAs = (page, role = "admin") =>
  new LoginPage(page).signInAs(role);
