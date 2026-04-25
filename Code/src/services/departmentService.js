import { userService } from "./userService";
import { MOCK_DEPARTMENTS } from "../mocks/departmentsMock";

let departments = [...MOCK_DEPARTMENTS];

class DepartmentService {
  async getDepartments() {
    try {
      // zaktualizuj liczbe pracowników na podstawie danych użytkownika
      const users = await userService.getUsers();
      departments = departments.map((dept) => ({
        ...dept,
        employeeCount: users.filter((user) => user.department === dept.name)
          .length,
      }));
      return Promise.resolve(departments);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDepartmentById(id) {
    try {
      const department = departments.find((d) => d.id === id);
      return Promise.resolve(department);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createDepartment(departmentData) {
    try {
      const newId = `DEP${String(departments.length + 1).padStart(3, "0")}`;
      const newDepartment = {
        id: newId,
        ...departmentData,
        employeeCount: 0,
        budgetSpent: 0,
      };
      departments.push(newDepartment);
      return Promise.resolve(newDepartment);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateDepartment(id, departmentData) {
    try {
      const index = departments.findIndex((d) => d.id === id);
      if (index !== -1) {
        departments[index] = {
          ...departments[index],
          ...departmentData,
        };
        return Promise.resolve(departments[index]);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteDepartment(id) {
    try {
      // sprawdz czy dzial ma pracownikow
      const users = await userService.getUsers();
      const departmentToDelete = departments.find((d) => d.id === id);
      const hasEmployees = users.some(
        (user) => user.department === departmentToDelete.name,
      );

      if (hasEmployees) {
        throw new Error("Cannot delete department with active employees");
      }

      departments = departments.filter((d) => d.id !== id);
      return Promise.resolve({ success: true });
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    console.error("Department Service Error:", error);
    throw error;
  }
}

export const departmentService = new DepartmentService();
