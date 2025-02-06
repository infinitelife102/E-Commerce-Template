import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 5173,
    strictPort: false, // Use next port (5174, ...) if 5173 is in use
    host: true,        // Bind to 0.0.0.0 to avoid localhost connection issues
    open: true,        // Open browser automatically
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
