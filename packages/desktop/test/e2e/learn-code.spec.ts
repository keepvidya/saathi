import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/12-learn-code/screenshots'

/** TC-12.3.1 — Learn code blocks are syntax-highlighted by Shiki (progressive). */
test('TC-12.3 — Learn: code block is highlighted by Shiki', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="learn"]')
  await expect(win.locator('.learn')).toBeVisible()

  // The highlighter is async — Playwright waits for the swap.
  const shiki = win.locator('.lsn-code .shiki').first()
  await expect(shiki).toBeVisible()
  // a coloured token carries the dual-theme CSS vars
  await expect(win.locator('.lsn-code .shiki span[style*="--shiki-light"]').first()).toBeVisible()
  await shiki.scrollIntoViewIfNeeded()
  await win.screenshot({ path: `${SHOTS}/learn-code-light.png` })

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await shiki.scrollIntoViewIfNeeded()
  await win.screenshot({ path: `${SHOTS}/learn-code-dark.png` })

  await app.close()
})
