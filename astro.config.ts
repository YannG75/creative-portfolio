import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://yanng.xyz',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'use-sync-external-store/shim/with-selector',
        'use-sync-external-store/shim',
        '@react-three/fiber',
        'three',
      ],
    },
  },
})
