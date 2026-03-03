import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api/auth": {
        target: "http://localhost:5000",
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[PROXY] Sending Request:', req.method, req.url, '-> http://localhost:5000');
          });
        },
      },
      "/api/user": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/api/kitchen": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/api/search": {
        target: "http://localhost:5002",
        changeOrigin: true,
      },
      "/api/cart": {
        target: "http://localhost:5003",
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[PROXY ERROR] /api/cart ->', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[PROXY] Sending Request:', req.method, req.url, '-> http://localhost:5003');
          });
        },
      },
      "/api/orders": {
        target: "http://localhost:5003",
        changeOrigin: true,
      },
    },
  },
});
