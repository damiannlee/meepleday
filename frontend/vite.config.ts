import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Backend default port is 8080; override with BACKEND_URL when running elsewhere.
const backend = process.env.BACKEND_URL ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: backend, changeOrigin: true },
      // OAuth2 login redirect + provider callback, so the login links work through the dev server too.
      "/oauth2": { target: backend, changeOrigin: true },
      "/login/oauth2": { target: backend, changeOrigin: true },
    },
  },
});
