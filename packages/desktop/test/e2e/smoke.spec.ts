import { test, expect, _electron as electron } from '@playwright/test'

/**
 * TC-00.3.* — real Electron app. Requires `npm run build` first
 * (loads out/main/index.js via package.json "main").
 */
test('TC-00.3 — launch, navigate, toggle theme', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  // TC-00.3.1 — branded shell + default pane
  await expect(win.locator('.railbrand')).toContainText('Saathi')
  await expect(win.locator('#body [data-pane]')).toHaveAttribute('data-pane', 'chat')

  // TC-00.3.2 — navigate
  await win.click('[data-pane="office"]')
  await expect(win.locator('#body [data-pane]')).toHaveAttribute('data-pane', 'office')

  // Visual artifact — light theme
  await win.click('[data-pane="chat"]')
  await win.screenshot({
    path: '../../docs/features/00-walking-skeleton/screenshots/shell-light.png',
  })

  // TC-00.3.3 — theme toggle
  const before = await win.locator('html').getAttribute('data-theme')
  await win.click('#theme-toggle')
  const after = await win.locator('html').getAttribute('data-theme')
  expect(after).not.toBe(before)

  // Visual artifact — dark theme
  await win.screenshot({
    path: '../../docs/features/00-walking-skeleton/screenshots/shell-dark.png',
  })

  await app.close()
})
