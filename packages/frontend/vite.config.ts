import { defineConfig } from 'vite'

// Standalone UI dev server — runs the frontend in a plain browser, no Electron.
// The bridge falls back gracefully when no preload is present.
export default defineConfig({
  server: { port: 5180 },
})
