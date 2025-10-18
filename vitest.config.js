import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "src/tests/",
        "*.config.js",
        "**/*.spec.jsx",
        "**/*.test.jsx",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "../../../contexts/SiteSettingsContext": path.resolve(
        __dirname,
        "./src/tests/mocks/SiteSettingsContext.js"
      ),
    },
  },
});
