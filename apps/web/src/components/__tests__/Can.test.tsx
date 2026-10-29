import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import Can from "../auth/Can";
import { updateSessionUser } from "../../auth/session";

const signIn = (permissions: string[]) =>
  localStorage.setItem(
    "user",
    JSON.stringify({ name: "x", email: "x@x", role: "Employee", permissions }),
  );

describe("<Can>", () => {
  it("renders children for a user with the permission", () => {
    signIn(["users.create"]);
    render(<Can permission="users.create">Add user</Can>);
    expect(screen.getByText("Add user")).toBeInTheDocument();
  });

  it("renders the fallback otherwise", () => {
    signIn(["profile.view"]);
    render(
      <Can permission="users.create" fallback="read only">
        Add user
      </Can>,
    );
    expect(screen.queryByText("Add user")).not.toBeInTheDocument();
    expect(screen.getByText("read only")).toBeInTheDocument();
  });

  it("treats the wildcard as every permission", () => {
    signIn(["*"]);
    render(<Can permission="roles.delete">Delete</Can>);
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("updates when the session changes", () => {
    signIn([]);
    render(<Can permission="users.create">Add user</Can>);
    expect(screen.queryByText("Add user")).not.toBeInTheDocument();

    act(() =>
      updateSessionUser({
        name: "x",
        email: "x@x",
        role: "Admin",
        permissions: ["users.create"],
      }),
    );
    expect(screen.getByText("Add user")).toBeInTheDocument();
  });
});
