import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:80',
    },
    host: '0.0.0.0',
    port: 3001,
    strictPort: false,
    allowedHosts: ['all'], // pozwol na wszystkie hosty
  }
})
