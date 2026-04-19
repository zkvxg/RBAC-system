/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
      fontFamily: {
        sans: ["Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
