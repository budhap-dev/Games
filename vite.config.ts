import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg'],
      manifest: {
        name: 'PlayPatch',
        short_name: 'PlayPatch',
        description: 'A bright little patch of playground: arcade games and brain teasers for kids.',
        theme_color: '#FF7A1A',
        background_color: '#F6F8FC',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
        shortcuts: [
          { name: 'Table Rockstars', short_name: 'Tables', url: '/play/tables?start=1', icons: [{ src: 'icons/icon.svg', sizes: 'any' }] },
          { name: 'Snake', short_name: 'Snake', url: '/play/snake?start=1', icons: [{ src: 'icons/icon.svg', sizes: 'any' }] },
          { name: '2048', short_name: '2048', url: '/play/g2048?start=1', icons: [{ src: 'icons/icon.svg', sizes: 'any' }] },
          { name: 'Sudoku 9×9', short_name: 'Sudoku', url: '/play/sudoku9?start=1', icons: [{ src: 'icons/icon.svg', sizes: 'any' }] },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'jsdom', globals: true },
} as Parameters<typeof defineConfig>[0])
