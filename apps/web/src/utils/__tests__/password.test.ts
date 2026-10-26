import { describe, expect, it } from "vitest";
import { validatePassword } from "@rbac/shared";
import { generateTemporaryPassword } from "../password";

describe("generateTemporaryPassword", () => {
  it("always satisfies the shared password policy", () => {
    for (let i = 0; i < 200; i++) {
      expect(validatePassword(generateTemporaryPassword())).toBeNull();
    }
  });

  it("avoids characters that are easy to misread", () => {
    const sample = Array.from({ length: 50 }, () =>
      generateTemporaryPassword(),
    ).join("");
    expect(sample).not.toMatch(/[0O1lI]/);
  });

  it("does not repeat itself", () => {
    expect(generateTemporaryPassword()).not.toBe(generateTemporaryPassword());
  });
});
