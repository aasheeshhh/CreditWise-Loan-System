import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

/** Fail fast if production build runs without the API URL env var. */
function requireProductionApiUrl(): Plugin {
  return {
    name: "require-production-api-url",
    config(_config, { mode }) {
      if (mode === "production" && !process.env.VITE_API_URL?.trim()) {
        throw new Error(
          "VITE_API_URL must be set for production builds (e.g. https://your-api.onrender.com).",
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    requireProductionApiUrl(),
  ],
  build: {
    outDir: "dist",
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
