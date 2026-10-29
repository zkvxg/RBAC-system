import type { SessionUiUser } from "../types";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const SESSION_UPDATED_EVENT = "user-updated";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getSessionUser = (): SessionUiUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUiUser;
  } catch {
    return null;
  }
};

export const saveSession = (token: string, user: SessionUiUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const updateSessionUser = (user: SessionUiUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(
    new CustomEvent(SESSION_UPDATED_EVENT, { detail: user }),
  );
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
