import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { defineConfig } from 'vite'
import flowbiteReact from 'flowbite-react/plugin/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    flowbiteReact(),
  ],
})
