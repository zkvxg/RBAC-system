import { API_BASE_URL } from "../config/runtime";

export const API_URL = `${API_BASE_URL}/api`;

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const rethrow = (scope: string) => (error: unknown) => {
  console.error(`${scope} Error:`, error);
  throw error;
};
