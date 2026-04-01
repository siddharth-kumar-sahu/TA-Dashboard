import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // Required plugins
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Modern way to map '@' to 'src'
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  
})