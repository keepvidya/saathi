import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/01-shell-themes/screenshots'

/** TC-01.3.1 — brand themes select & persist across relaunch (+ visual artifacts). */
test('TC-01.3 — Light/Medium/Dark select; Dark persists across relaunch', async () => {
  const app = await electron.launch({ args: ['.'] })
  let win = await app.firstWindow()

  // default Light
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'light')
  await win.screenshot({ path: `${SHOTS}/light.png` })

  // open gallery → exactly 3 brand swatches
  await win.click('#theme-gallery-btn')
  await expect(win.locator('#theme-menu [data-skin]')).toHaveCount(3)

  // Medium
  await win.click('[data-skin="medium"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'medium')
  await win.screenshot({ path: `${SHOTS}/medium.png` })

  // Dark
  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await win.screenshot({ path: `${SHOTS}/dark.png` })

  await app.close()

  // relaunch → Dark persisted, copper accent (#D98E5A)
  const app2 = await electron.launch({ args: ['.'] })
  win = await app2.firstWindow()
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  const primary = await win.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
  )
  expect(primary.toLowerCase()).toBe('#d98e5a')
  await app2.close()
})
