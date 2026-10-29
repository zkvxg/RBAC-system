import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// long-lived vendor chunks so a deploy of app code keeps them cached
const VENDOR_CHUNKS: Record<string, string[]> = {
  "react-vendor": ["react", "react-dom", "react-router", "react-router-dom"],
  "chakra-vendor": ["@chakra-ui", "@emotion"],
  "chart-vendor": ["recharts"],
  icons: ["@heroicons/react"],
};

const vendorChunk = (id: string) => {
  const match = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (!match?.[1]) return undefined;
  const pkg = match[1];
  return Object.keys(VENDOR_CHUNKS).find((chunk) =>
    VENDOR_CHUNKS[chunk]!.some(
      (name) => pkg === name || pkg.startsWith(`${name}/`),
    ),
  );
};

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@rbac/shared": fileURLToPath(
        new URL("../../packages/shared/src/index.ts", import.meta.url),
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: vendorChunk,
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@chakra-ui/react",
      "recharts",
    ],
  },
});
