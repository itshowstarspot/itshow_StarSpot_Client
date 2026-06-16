import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetUrl = mode === 'development' ? env.VITE_PROXY_TARGET : ''

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target: targetUrl, changeOrigin: true, secure: false },
        '/feeds': { target: targetUrl, changeOrigin: true, secure: false },
        '/uploads': { target: targetUrl, changeOrigin: true, secure: false }
      }
    }
  }
})