import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['packages/**/test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      // Gate the new LOGIC modules across packages (UI panes covered by integration/e2e).
      include: [
        'packages/shared/src/**',
        'packages/domain/src/**',
        'packages/backend/src/**',
        'packages/frontend/src/theme/**',
        'packages/frontend/src/shell/router.ts',
        'packages/frontend/src/bridge/**',
        'packages/frontend/src/agent/**',
        'packages/frontend/src/chat/**',
        'packages/desktop/src/preload/build-api.ts',
        'packages/desktop/src/main/security.ts',
      ],
      // Pure re-export barrels carry no logic — they are exercised via package imports, not gated.
      exclude: ['**/index.ts'],
      thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
    },
  },
})
