import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Указываем корень для фронтенд-части
  root: fileURLToPath(new URL('./', import.meta.url)),
  // Опционально: Настройка для продакшена, если приложение будет не в корне
  base: process.env.NODE_ENV === 'production' ? '/static/' : '/',
  server: {
    // Порт dev-сервера Vite
    port: 5173,
    // Опционально: Настройка прокси для API-запросов в разработке
    // Чтобы избежать CORS при обращении к Express-серверу
    proxy: {
      '/api': {
        target: 'http://localhost:7000', // Куда перенаправлять запросы
        changeOrigin: true
      },
      '/socket.io': {
        target: 'ws://localhost:7000', // Для WebSocket (Socket.io)
        ws: true
      }
    }
  },
  build: {
    // Куда складывать результат сборки
    outDir: '../server/dist-public',
    emptyOutDir: true
  }
})