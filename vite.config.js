import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 🌟 프론트엔드 포트를 원래 기본 포트인 5173으로 격리하여 되돌립니다!
    strictPort: true,
    proxy: {
      // 🌟 /api로 시작하는 모든 요청은 진짜 노드 백엔드 서버(5000포트)로 우회시킵니다.
      '/api': {
        target: 'http://localhost:5000', 
        changeOrigin: true,
        secure: false,
      }
    }
  }
})