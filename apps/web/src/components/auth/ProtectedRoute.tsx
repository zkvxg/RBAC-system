import { Navigate, useLocation, Outlet } from "react-router-dom";
import { authService } from "../../services/authService";
import { getToken } from "../../auth/session";
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
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

  if (allowedRoles && !authService.hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
