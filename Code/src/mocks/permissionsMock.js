export const AVAILABLE_PERMISSIONS = {
  users: {
    name: "User Management",
    permissions: [
      { id: "users.view", name: "View Users" },
      { id: "users.create", name: "Create Users" },
      { id: "users.edit", name: "Edit Users" },
      { id: "users.delete", name: "Delete Users" },
    ],
  },
  roles: {
    name: "Role Management",
    permissions: [
      { id: "roles.view", name: "View Roles" },
      { id: "roles.create", name: "Create Roles" },
      { id: "roles.edit", name: "Edit Roles" },
      { id: "roles.delete", name: "Delete Roles" },
    ],
  },
  reports: {
    name: "Reports",
    permissions: [
      { id: "reports.view", name: "View Reports" },
      { id: "reports.create", name: "Create Reports" },
      { id: "reports.export", name: "Export Reports" },
    ],
  },
};
