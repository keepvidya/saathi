import { defineConfig } from '@playwright/test'

// E2E runs the real built Electron app. Run `npm run build` (in this package) first.
export default defineConfig({
  testDir: './test/e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  // CI retries absorb the occasional Electron single-instance relaunch race.
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
})
