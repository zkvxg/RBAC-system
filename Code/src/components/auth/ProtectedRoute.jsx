import { Navigate, useLocation, Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import { authService } from "../../services/authService";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  // komponent do ochrony tras, przekierowuje niezalogowanych do logowania
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    // sprawdzenie przy kazdym odwiedzeniu, czy token wciaz istnieje
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // sprawdzenie roli - jesli podano allowedRoles, a uzytkownik nie ma odpowiedniej roli, przekieruj na dashboard
  if (allowedRoles && !authService.hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
