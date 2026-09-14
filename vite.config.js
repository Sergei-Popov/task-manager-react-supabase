import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // В разработке запросы к /api уходят на локальный бэкенд
      "/api": {
        target: process.env.VITE_API_PROXY || "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
});
