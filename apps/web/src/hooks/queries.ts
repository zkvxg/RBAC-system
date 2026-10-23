import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { roleService } from "../services/roleService";
import { departmentService } from "../services/departmentService";
import type { DepartmentFormData, RoleFormData, UserFormData } from "../types";

export const queryKeys = {
  users: ["users"] as const,
  roles: ["roles"] as const,
  departments: ["departments"] as const,
};

const ALL_LISTS = [queryKeys.users, queryKeys.roles, queryKeys.departments];

const useInvalidate = (keys: readonly (readonly string[])[]) => {
  const client = useQueryClient();
  return () =>
    Promise.all(keys.map((queryKey) => client.invalidateQueries({ queryKey })));
};

export const useUsers = () =>
  useQuery({
    queryKey: queryKeys.users,
    queryFn: () => userService.getUsers(),
    meta: { errorMessage: "Error loading users" },
  });

export const useRoles = () =>
  useQuery({
    queryKey: queryKeys.roles,
    queryFn: () => roleService.getRoles(),
    meta: { errorMessage: "Error loading roles" },
  });

export const useDepartments = () =>
  useQuery({
    queryKey: queryKeys.departments,
    queryFn: () => departmentService.getDepartments(),
    meta: { errorMessage: "Error loading departments" },
  });

export const useCreateUser = () =>
  useMutation({
    mutationFn: (data: UserFormData) => userService.createUser(data),
    onSuccess: useInvalidate(ALL_LISTS),
  });

export const useUpdateUser = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserFormData }) =>
      userService.updateUser(id, data),
    onSuccess: useInvalidate(ALL_LISTS),
  });

export const useDeleteUser = () =>
  useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: useInvalidate(ALL_LISTS),
  });

export const useCreateRole = () =>
  useMutation({
    mutationFn: (data: RoleFormData) => roleService.createRole(data),
    onSuccess: useInvalidate([queryKeys.roles]),
  });

export const useUpdateRole = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleFormData }) =>
      roleService.updateRole(id, data),
    onSuccess: useInvalidate([queryKeys.roles, queryKeys.users]),
  });

export const useDeleteRole = () =>
  useMutation({
    mutationFn: (id: number) => roleService.deleteRole(id),
    onSuccess: useInvalidate([queryKeys.roles, queryKeys.users]),
  });

export const useCreateDepartment = () =>
  useMutation({
    mutationFn: (data: DepartmentFormData) =>
      departmentService.createDepartment(data),
    onSuccess: useInvalidate([queryKeys.departments]),
  });

export const useUpdateDepartment = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: string; data: DepartmentFormData }) =>
      departmentService.updateDepartment(id, data),
    onSuccess: useInvalidate([queryKeys.departments]),
  });

export const useDeleteDepartment = () =>
  useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: useInvalidate([queryKeys.departments]),
  });
