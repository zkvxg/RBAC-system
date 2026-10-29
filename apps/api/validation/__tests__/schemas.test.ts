import { describe, expect, it } from "vitest";
import { listUsers, createUser } from "../userSchemas";
import { createRole } from "../roleSchemas";

describe("listUsers query", () => {
  it("applies defaults", () => {
    expect(listUsers.query.parse({})).toEqual({
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      order: "DESC",
    });
  });

  it("coerces query strings", () => {
    expect(
      listUsers.query.parse({ page: "2", isActive: "false", order: "asc" }),
    ).toMatchObject({ page: 2, isActive: false, order: "ASC" });
  });

  it("caps the page size", () => {
    expect(listUsers.query.safeParse({ limit: "101" }).success).toBe(false);
  });
});

describe("createUser body", () => {
  const valid = {
    username: "ada",
    email: " Ada@Example.COM ",
    password: "password1",
  };

  it("normalises the email", () => {
    expect(createUser.body.parse(valid).email).toBe("ada@example.com");
  });

  it("enforces the shared password policy", () => {
    const result = createUser.body.safeParse({ ...valid, password: "letters" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Password must be at least 8 characters long",
    );
  });
});

describe("createRole body", () => {
  it("rejects permissions outside the catalog", () => {
    const result = createRole.body.safeParse({
      name: "auditor",
      description: "x",
      permissions: ["users.view", "users.fly"],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Unknown permission");
  });
});
