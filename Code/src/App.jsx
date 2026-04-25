import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  ChakraProvider,
  ColorModeScript,
  Spinner,
  Center,
  extendTheme,
} from "@chakra-ui/react";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { authService } from "./services/authService";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

// lazy loading komponentow stron, laduja sie dopiero gdy sa potrzebne
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Users = lazy(() => import("./pages/Users"));
const Roles = lazy(() => import("./pages/Roles"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Profile = lazy(() => import("./pages/Profile"));
const Departments = lazy(() => import("./pages/Departments"));
const Settings = lazy(() => import("./pages/Settings"));

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  styles: {
    global: {
      "html, body": {
        colorMode: "light",
      },
    },
  },
  colors: {
    "rbac-system": {
      50: "#f5f7fb",
      100: "#e6ecf5",
      200: "#c8d4e8",
      300: "#a9b8da",
      400: "#7c94c6",
      500: "#4f6fb2",
      600: "#3a5590",
      700: "#2a3f6e",
      800: "#1b2a4b",
      900: "#111a33",
    },
  },
  fonts: {
    heading: "Arial, sans-serif",
    body: "Arial, sans-serif",
  },
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 300,
    medium: 400,
    semibold: 500,
    bold: 500,
    extrabold: 600,
    black: 700,
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          bg: "white",
          border: "1px solid",
          borderColor: "rbac-system.100",
          borderRadius: "sm",
          boxShadow: "0 10px 30px rgba(17, 26, 51, 0.08)",
          _dark: {
            bg: "rbac-system.900",
            borderColor: "whiteAlpha.200",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.35)",
          },
        },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: "0.125rem",
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "sm",
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: "sm",
        },
      },
    },
    Textarea: {
      baseStyle: {
        borderRadius: "sm",
      },
    },
  },
});

const LoadingFallback = () => (
  <Center h="100vh">
    <Spinner size="xl" color="rbac-system.500" thickness="4px" />
  </Center>
);

// niezalogowany na "/" -> /login, zalogowany -> /dashboard
const RootRedirect = () => (
  <Navigate
    to={authService.isAuthenticated() ? "/dashboard" : "/login"}
    replace
  />
);

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <Router>
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
                    <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/roles"
                  element={
                    <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                      <Roles />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/departments"
                  element={
                    <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
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
        </Router>
      </ChakraProvider>
      <VercelAnalytics />
    </>
  );
}

export default App;
