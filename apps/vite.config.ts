import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, 'web'),
  publicDir: path.resolve(__dirname, 'web/public'),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'web/src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'web/dist'),
    emptyOutDir: true,
  },
  server: { port: 5173 }
})
