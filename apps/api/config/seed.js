const { User, Role } = require("../models");

const ROLES = [
  {
    name: "admin",
    description: "Administrator",
    permissions: [
      "users.view",
      "users.create",
      "users.edit",
      "users.delete",
      "roles.view",
      "roles.create",
      "roles.edit",
      "roles.delete",
      "reports.view",
      "reports.create",
      "reports.export",
      "profile.view",
      "profile.edit",
    ],
  },
  {
    name: "manager",
    description: "Manager",
    permissions: [
      "users.view",
      "roles.view",
      "reports.view",
      "reports.create",
      "profile.view",
      "profile.edit",
    ],
  },
  {
    name: "employee",
    description: "Default employee role",
    permissions: ["profile.view", "profile.edit"],
  },
];

const USERS = [
  {
    username: "admin",
    email: "admin@test.com",
    password: "test123",
    role: "admin",
    name: "Admin Test",
    department: "IT",
    phone: "111222333",
    location: "HQ",
  },
  {
    username: "manager",
    email: "manager@test.com",
    password: "test123",
    role: "manager",
    name: "Manager Test",
    department: "Sales",
    phone: "222333444",
    location: "Warsaw",
  },
  {
    username: "employee",
    email: "employee@test.com",
    password: "test123",
    role: "employee",
    name: "Employee Test",
    department: "Marketing",
    phone: "333444555",
    location: "Krakow",
  },
];

async function seedDefaults() {
  const rolesByName = {};
  for (const r of ROLES) {
    const [role] = await Role.findOrCreate({
      where: { name: r.name },
      defaults: {
        description: r.description,
        permissions: r.permissions,
      },
    });
    rolesByName[r.name] = role;
  }

  for (const u of USERS) {
    const existing = await User.findOne({ where: { email: u.email } });
    if (existing) continue;
    await User.create({
      username: u.username,
      email: u.email,
      password: u.password,
      name: u.name,
      department: u.department,
      phone: u.phone,
      location: u.location,
      RoleId: rolesByName[u.role].id,
    });
  }
}

module.exports = { seedDefaults };
