import { describe, expect, it } from "vitest";
import { PERMISSION_KEYS, WILDCARD } from "@rbac/shared";
import { PERMISSION_GROUPS } from "../permissionGroups";

describe("PERMISSION_GROUPS", () => {
  const offered = Object.values(PERMISSION_GROUPS).flatMap((group) =>
    group.permissions.map((p) => p.id),
  );

  it("offers every catalog permission except the wildcard", () => {
    expect(offered).not.toContain(WILDCARD);
    expect(offered.sort()).toEqual(
      PERMISSION_KEYS.filter((key) => key !== WILDCARD).sort(),
    );
  });

  it("groups permissions by resource", () => {
    expect(PERMISSION_GROUPS.users?.name).toBe("User Management");
    expect(PERMISSION_GROUPS.users?.permissions.map((p) => p.id)).toEqual([
      "users.view",
      "users.create",
      "users.edit",
      "users.delete",
    ]);
  });
});
