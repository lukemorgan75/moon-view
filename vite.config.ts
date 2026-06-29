import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const sefariaProxy = {
  '/sefaria-export': {
    target: 'https://storage.googleapis.com',
    changeOrigin: true,
  },
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/moon-view/' : '/',
  plugins: [react()],
  server: { proxy: sefariaProxy },
  preview: { proxy: sefariaProxy },
})
