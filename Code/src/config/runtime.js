export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// domyslnie wlaczony jest tryb symulacji, aby zachować obecne zachowanie w przypadku braku zmiennej srodowiskowej
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== "false";

export const toUiRole = (role) => {
  if (!role) {
    return "Employee";
  }

  const normalized = String(role).toLowerCase();
  if (normalized === "admin") {
    return "Admin";
  }
  if (normalized === "manager") {
    return "Manager";
  }

  return "Employee";
};

export const toApiRoleName = (role) => {
  if (!role) {
    return "employee";
  }

  const normalized = String(role).toLowerCase();
  if (normalized === "admin") {
    return "admin";
  }
  if (normalized === "manager") {
    return "manager";
  }
  if (normalized === "employee") {
    return "employee";
  }

  return normalized;
};
