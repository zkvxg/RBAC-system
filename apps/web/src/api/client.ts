import axios, { AxiosHeaders } from "axios";
import { API_BASE_URL } from "../config/runtime";
import { clearSession, getToken } from "../auth/session";

export const api = axios.create({ baseURL: `${API_BASE_URL}/api` });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const isLoginAttempt =
      axios.isAxiosError(error) && error.config?.url === "/auth/login";
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !isLoginAttempt
    ) {
      clearSession();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);
