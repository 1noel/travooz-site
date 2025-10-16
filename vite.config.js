import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // binds to 0.0.0.0
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    allowedHosts: [
      'travooz-frontend.onrender.com' // add your Render URL here
    ]
  }
})
