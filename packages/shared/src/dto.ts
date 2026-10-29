export interface RoleDto {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  name: string | null;
  department: string | null;
  phone: string | null;
  location: string | null;
  isActive: boolean;
  RoleId: number | null;
  Role: Pick<RoleDto, "id" | "name" | "permissions"> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface SessionUser {
  id: number;
  username: string;
  role: string;
  permissions: string[];
}

export interface LoginResponse {
  token: string;
  user: SessionUser;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: ApiErrorDetail[];
}

export type SortOrder = "asc" | "desc";

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
  isActive?: boolean;
  sortBy?: "createdAt" | "username" | "email" | "name";
  order?: SortOrder;
}
