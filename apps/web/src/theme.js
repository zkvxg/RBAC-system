import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
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

export default theme;
