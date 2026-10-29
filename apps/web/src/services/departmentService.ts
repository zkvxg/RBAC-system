import { userService } from "./userService";
import { MOCK_DEPARTMENTS } from "../mocks/departmentsMock";
import { rethrow } from "./http";
import type { DeleteResult, Department, DepartmentFormData } from "../types";

const handleError = rethrow("Department Service");

let departments: Department[] = [...MOCK_DEPARTMENTS];

class DepartmentService {
  async getDepartments(): Promise<Department[]> {
    try {
      const users = await userService.getUsers();
      departments = departments.map((dept) => ({
        ...dept,
        employeeCount: users.filter((user) => user.department === dept.name)
          .length,
      }));
      return departments;
    } catch (error) {
      return handleError(error);
    }
  }

  async getDepartmentById(id: string): Promise<Department | undefined> {
    return departments.find((d) => d.id === id);
  }

  async createDepartment(
    departmentData: DepartmentFormData,
  ): Promise<Department> {
    const newDepartment: Department = {
      name: "",
      head: "",
      headId: "",
      budget: 0,
      status: "Active",
      location: "",
      description: "",
      ...departmentData,
      id: `DEP${String(departments.length + 1).padStart(3, "0")}`,
      employeeCount: 0,
      budgetSpent: 0,
    };
    departments.push(newDepartment);
    return newDepartment;
  }

  async updateDepartment(
    id: string,
    departmentData: DepartmentFormData,
  ): Promise<Department | undefined> {
    const index = departments.findIndex((d) => d.id === id);
    const existing = departments[index];
    if (!existing) return undefined;
    const updated = { ...existing, ...departmentData };
    departments[index] = updated;
    return updated;
  }

  async deleteDepartment(id: string): Promise<DeleteResult> {
    try {
      const users = await userService.getUsers();
      const departmentToDelete = departments.find((d) => d.id === id);
      const hasEmployees = users.some(
        (user) => user.department === departmentToDelete?.name,
      );
      if (hasEmployees) {
        throw new Error("Cannot delete department with active employees");
      }
      departments = departments.filter((d) => d.id !== id);
      return { success: true };
    } catch (error) {
      return handleError(error);
    }
  }
}

export const departmentService = new DepartmentService();
