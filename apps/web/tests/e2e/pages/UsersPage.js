import { expect } from "@playwright/test";

export class UsersPage {
  constructor(page) {
    this.page = page;
    this.addButton = page.getByRole("button", { name: /add user/i });
    this.createButton = page.getByRole("button", { name: /create user/i });
    this.updateButton = page.getByRole("button", { name: /update user/i });
  }

  async goto() {
    await this.page.goto("/users");
  }

  row(email) {
    return this.page.locator("tbody tr").filter({ hasText: email }).first();
  }

  async openEdit(email) {
    await this.row(email)
      .getByRole("button", { name: /edit user/i })
      .click();
  }

  async fillForm({ name, email, role, department, phone, location }) {
    const page = this.page;
    if (name !== undefined) await page.getByLabel("Full Name").fill(name);
    if (email !== undefined) await page.getByLabel("Email").fill(email);
    if (role) await page.getByLabel("Role").selectOption({ label: role });
    if (department) {
      await page.getByLabel("Department").selectOption({ label: department });
    }
    if (phone !== undefined) await page.getByLabel("Phone Number").fill(phone);
    if (location !== undefined)
      await page.getByLabel("Location").fill(location);
  }

  async createUser(suffix = Date.now()) {
    const user = {
      name: `E2E User ${suffix}`,
      email: `e2e-${suffix}@test.com`,
    };
    await this.goto();
    await this.addButton.click();
    await this.fillForm({
      ...user,
      role: "Employee",
      department: "IT",
      phone: "123456789",
      location: "Warsaw, Poland",
    });
    await this.createButton.click();
    await expect(
      this.page.getByText("User created successfully").first(),
    ).toBeVisible({ timeout: 10000 });
    await expect(this.createButton).toBeHidden({ timeout: 10000 });
    await expect(this.row(user.email)).toBeVisible({ timeout: 15000 });
    return user;
  }
}
