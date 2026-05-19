import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    proxy: {
      '/auth': 'http://localhost:5000',
      '/medicines': 'http://localhost:5000',
      '/shops': 'http://localhost:5000',
      '/subsidies': 'http://localhost:5000',
      '/forum': 'http://localhost:5000',
      '/consultations': 'http://localhost:5000',
      '/messages': 'http://localhost:5000',
      '/predict': 'http://localhost:5000',
      '/admin': 'http://localhost:5000',
      '/treatments': 'http://localhost:5000',
    }
  }
})
