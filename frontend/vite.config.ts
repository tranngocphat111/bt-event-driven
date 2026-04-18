import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// Frontend chạy port 80
// Tất cả API đi qua Gateway: 192.168.1.29:8085
// WebSocket notification đi payment-notification-service: 192.168.1.155:8084

export default defineConfig({
  define: {
    global: 'globalThis',
  },

  server: {
    host: '0.0.0.0',
    port: 80,
    strictPort: true,

    proxy: {
      // =========================
      // ALL REST APIs -> Gateway
      // =========================
      '/api': {
        target: 'http://192.168.1.29:8085',
        changeOrigin: true,
        secure: false,
      },

      // =========================
      // WebSocket Notification
      // =========================
      '/ws': {
        target: 'ws://192.168.1.155:8084',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },

    hmr: {
      host: '192.168.1.177',
      protocol: 'ws',
      port: 80,
    },
  },

  preview: {
    host: '0.0.0.0',
    port: 80,
    strictPort: true,
  },

  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
  ],
})