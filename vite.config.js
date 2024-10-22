import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    VitePWA({
      registerType:'autoUpdate',
      includeAssets: ['favicon.ico', 'icno_512.png', 'mask-icon.svg'],
      manifest: {
        name: 'All-in-Weather',
        short_name:'AiW',
        theme_color:'#ffffff',
        icons:[
        {
            src: './src/asserts/icno_192.png',
            sizes: '192x192',
            type: 'image/png'
        },
        {
            src: './src/asserts/icno_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
        }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
