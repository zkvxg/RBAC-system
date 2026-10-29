import type { ReactNode } from "react";
import type { Permission } from "@rbac/shared";
import { usePermission } from "../../hooks/useSession";

interface CanProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

function Can({ permission, children, fallback = null }: CanProps) {
  return <>{usePermission(permission) ? children : fallback}</>;
}

export default Can;
