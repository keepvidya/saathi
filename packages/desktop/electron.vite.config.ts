import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

// Workspace TS packages must be BUNDLED (they ship source, not built JS), so exclude
// them from externalization. Real node deps (electron, electron-updater) stay external.
export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({ exclude: ['@saathi/backend', '@saathi/domain', '@saathi/shared'] }),
    ],
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ['@saathi/shared'] })],
  },
  renderer: {},
})
