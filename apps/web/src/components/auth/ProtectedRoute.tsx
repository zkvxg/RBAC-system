import { Navigate, useLocation, Outlet } from "react-router-dom";
import { authService } from "../../services/authService";
import { getToken } from "../../auth/session";
import type { Permission } from "@rbac/shared";
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children?: ReactNode;
  permission?: Permission;
}

function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !authService.hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
