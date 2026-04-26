import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel serves the app at the root (`/`) — default `base: '/'` works.
// GitHub Pages serves at `/ViaVia/` — set BUILD_BASE=/ViaVia/ before
// `npm run build` for that target.
export default defineConfig({
  plugins: [react()],
  base: process.env.BUILD_BASE || '/',
})
