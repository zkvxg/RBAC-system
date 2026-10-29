import { Suspense, lazy, type ReactNode } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Spinner, Center } from "@chakra-ui/react";
import Layout from "./components/layout/Layout";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { authService } from "./services/authService";
import { SECTION_PERMISSIONS } from "./config/access";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Users = lazy(() => import("./pages/Users"));
const Roles = lazy(() => import("./pages/Roles"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Profile = lazy(() => import("./pages/Profile"));
const Departments = lazy(() => import("./pages/Departments"));
const Settings = lazy(() => import("./pages/Settings"));

const RouteErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary resetKey={useLocation().pathname}>{children}</ErrorBoundary>
);

const LoadingFallback = () => (
  <Center h="100vh">
    <Spinner size="xl" color="rbac-system.500" thickness="4px" />
  </Center>
);

const RootRedirect = () => (
  <Navigate
    to={authService.isAuthenticated() ? "/dashboard" : "/login"}
    replace
  />
);

function App() {
  return (
    <>
      <Router>
        <RouteErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />

              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute permission={SECTION_PERMISSIONS.users}>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/roles"
                  element={
                    <ProtectedRoute permission={SECTION_PERMISSIONS.roles}>
                      <Roles />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute permission={SECTION_PERMISSIONS.analytics}>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/departments"
                  element={
                    <ProtectedRoute
                      permission={SECTION_PERMISSIONS.departments}
                    >
                      <Departments />
                    </ProtectedRoute>
                  }
                />
                <Route path="/settings" element={<Settings />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </RouteErrorBoundary>
      </Router>
      <VercelAnalytics />
    </>
  );
}

export default App;
