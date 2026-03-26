import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.preview.emergentagent.com',
      '.preview.emergentcf.cloud',
      '.cluster-8.preview.emergentcf.cloud'
    ],
    hmr: {
      overlay: false, // Disable error overlay that can cause issues
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  // Optimize build
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
  },
});
