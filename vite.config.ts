import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/healthz': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/metrics': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/leads': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/conversations': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/run-prospecting': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/agent-config': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/audit-logs': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/token': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/config': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/database': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
