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
        "@heroicons/react/24/outline",
        "lucide-react",
        "react-hook-form",
        "@hookform/resolvers",
        "zod",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
      },
    },
    sourcemap: true,
    minify: "esbuild",
  },
});
