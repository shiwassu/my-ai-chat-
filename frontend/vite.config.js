import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    hmr: {
      clientPort: 443
    },
    // --- 这次新增了最关键的 allowedHosts 部分 ---
    // 明确允许所有来自 .gitpod.io 的主机访问
    allowedHosts: ['.gitpod.io'] 
  }
})