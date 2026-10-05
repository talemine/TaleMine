import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        /*
         * Split large, infrequently-changing vendor libraries into their
         * own chunks. These are then cached by the browser independently
         * of app code, so a new deploy (which changes app code) doesn't
         * force visitors to re-download React/Supabase/Framer Motion too.
         */
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react-router-dom") ||
              id.includes("/react/") ||
              id.includes("/react-dom/")
            ) {
              return "vendor-react";
            }

            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }

            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
          }
        },
      },
    },
  },
});
