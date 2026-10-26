import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import { saveSession } from "../../auth/session";

const renderAt = (permission?: "users.view") =>
  render(
    <MemoryRouter initialEntries={["/users"]}>
      <Routes>
        <Route path="/login" element={<p>login page</p>} />
        <Route path="/dashboard" element={<p>dashboard</p>} />
        <Route
          path="/users"
          element={
            <ProtectedRoute permission={permission}>
              <p>users page</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

const signIn = (permissions: string[]) =>
  saveSession("token", {
    name: "x",
    email: "x@x",
    role: "Employee",
    permissions,
  });

describe("<ProtectedRoute>", () => {
  it("sends anonymous visitors to the login page", () => {
    renderAt("users.view");
    expect(screen.getByText("login page")).toBeInTheDocument();
  });

  it("sends users without the section permission to the dashboard", () => {
    signIn(["profile.view"]);
    renderAt("users.view");
    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });

  it("renders the page for a user with the permission", () => {
    signIn(["users.view"]);
    renderAt("users.view");
    expect(screen.getByText("users page")).toBeInTheDocument();
  });

  it("only requires a session when no permission is given", () => {
    signIn([]);
    renderAt();
    expect(screen.getByText("users page")).toBeInTheDocument();
  });
});
