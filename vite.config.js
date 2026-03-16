import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages deploys to: https://zzjobzzz-hub.github.io/Climate_crm/
// The `base` must match the repository name exactly (case-sensitive)
export default defineConfig({
  plugins: [react()],
  base: "/Climate_crm/",
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
