import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  define: {
    global: 'globalThis',
  },

  server: {
    host: '0.0.0.0',
    port: 80,
    strictPort: true,
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