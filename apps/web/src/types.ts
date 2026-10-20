export type UiRoleName = "Admin" | "Manager" | "Employee";
export type Status = "Active" | "Inactive";

export interface UiUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: string;
  status: Status;
  department: string;
  joinDate?: string;
  lastActive?: string;
  phone: string;
  location: string;
  permissions?: string[];
}

export type UserFormData = Partial<Omit<UiUser, "id">> & { password?: string };

export interface UiRole {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  status: Status;
  userCount?: number;
}

export type RoleFormData = Pick<UiRole, "name" | "description"> &
  Partial<Pick<UiRole, "permissions" | "status">>;

export interface Department {
  id: string;
  name: string;
  head: string;
  headId: string;
  employeeCount: number;
  budget: number;
  budgetSpent: number;
  status: Status;
  location: string;
  description: string;
  createdAt?: string;
  lastUpdated?: string;
  projects?: number;
  teamLeads?: string[];
}

export type DepartmentFormData = Partial<Omit<Department, "id">>;

export interface SessionUiUser {
  id?: string;
  name: string;
  email: string;
  role: string;
  status?: Status;
  department?: string;
  permissions: string[];
}

export interface DeleteResult {
  success: true;
}
