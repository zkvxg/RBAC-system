import { useSyncExternalStore } from "react";
import { hasPermission, type Permission } from "@rbac/shared";
import { SESSION_UPDATED_EVENT, getSessionUser } from "../auth/session";
import type { SessionUiUser } from "../types";

const subscribe = (onChange: () => void) => {
  window.addEventListener(SESSION_UPDATED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SESSION_UPDATED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

// snapshots must be referentially stable between calls, so the parsed user
// is cached until the stored value changes
let cachedRaw: string | null = null;
let cachedUser: SessionUiUser | null = null;
const getSnapshot = () => {
  const raw = localStorage.getItem("user");
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = getSessionUser();
  }
  return cachedUser;
};

export const useSessionUser = () =>
  useSyncExternalStore(subscribe, getSnapshot);

export const usePermission = (permission: Permission): boolean => {
  const user = useSessionUser();
  return !!user && hasPermission(user.permissions, permission);
};
