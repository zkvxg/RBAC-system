import type { UiRoleName } from "../types";

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (USE_MOCKS ? window.location.origin : "http://localhost:5000");

export const toUiRole = (role: string | null | undefined): UiRoleName => {
  const normalized = String(role ?? "").toLowerCase();
  if (normalized === "admin") return "Admin";
  if (normalized === "manager") return "Manager";
  return "Employee";
};

export const toApiRoleName = (role: string | null | undefined): string => {
  if (!role) return "employee";
  return String(role).toLowerCase();
};
