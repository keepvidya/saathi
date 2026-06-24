import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/13-learn-diagram/screenshots'

/** TC-13.3.1 — Learn renders a Mermaid diagram and re-renders it on a theme switch. */
test('TC-13.3 — Learn: diagram renders + re-renders on theme switch', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="learn"]')
  await expect(win.locator('.learn')).toBeVisible()

  // Mermaid is async — Playwright waits for the SVG to swap in.
  const svg = win.locator('.lsn-diagram svg').first()
  await expect(svg).toBeVisible()
  await svg.scrollIntoViewIfNeeded()
  await win.screenshot({ path: `${SHOTS}/learn-diagram-light.png` })

  // Theme switch → the diagram re-renders (still an svg present after).
  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(win.locator('.lsn-diagram svg').first()).toBeVisible()
  await win.locator('.lsn-diagram svg').first().scrollIntoViewIfNeeded()
  await win.screenshot({ path: `${SHOTS}/learn-diagram-dark.png` })

  await app.close()
})
