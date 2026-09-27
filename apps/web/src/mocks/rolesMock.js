export const MOCK_ROLES = [
  {
    id: 1,
    name: "Admin",
    description: "Full system access",
    permissions: ["users.manage", "roles.manage", "reports.view"],
    status: "Active",
  },
  {
    id: 2,
    name: "Manager",
    description: "Team management access",
    permissions: ["users.view", "reports.view", "reports.create"],
    status: "Active",
  },
  {
    id: 3,
    name: "Employee",
    description: "Basic access",
    permissions: ["reports.view"],
    status: "Active",
  },
];
