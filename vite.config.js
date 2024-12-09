import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';



export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon_512.png', 'mask-icon.svg'],
      manifest: {
        name: 'All-in-Weather',
        short_name: 'AiW',
        theme_color: '#ffffff',
        icons: [
          {
            src: './src/asserts/icon/icon_192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './src/asserts/icon/icon_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL, // Spring Boot 서버 주소
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
