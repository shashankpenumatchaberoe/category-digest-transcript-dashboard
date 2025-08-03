import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: '/category-digest-transcript-dashboard/',
  optimizeDeps: {
    exclude: ['sql.js']
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}))
