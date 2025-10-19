import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.jsx"),
      name: "PageBuilder",
      formats: ["es", "cjs"],
      fileName: (format) => `page-builder.${format === "es" ? "es.js" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-markdown",
        "react-colorful",
        "@heroicons/react",
        "@heroicons/react/24/outline",
        "lucide-react",
        "react-hook-form",
        "@hookform/resolvers",
        "zod",
      ],
      output: {
        // Preserve module structure to avoid circular dependency issues
        preserveModules: false,
        // Use named exports
        exports: "named",
        // Avoid variable hoisting issues
        hoistTransitiveImports: false,
        // Proper globals mapping
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
        // Ensure proper interop for CJS
        interop: "auto",
      },
    },
    sourcemap: true,
    // Disable minification to avoid hoisting issues
    minify: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
});
