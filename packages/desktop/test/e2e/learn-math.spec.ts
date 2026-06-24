import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/11-learn-math/screenshots'

/** TC-11.3.1 — Learn renders typeset KaTeX math. */
test('TC-11.3 — Learn: math block is typeset by KaTeX', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="learn"]')
  await expect(win.locator('.learn')).toBeVisible()

  const math = win.locator('.lsn-math .katex').first()
  await expect(math).toBeVisible()
  await math.scrollIntoViewIfNeeded()
  await win.screenshot({ path: `${SHOTS}/learn-math-light.png` })

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await math.scrollIntoViewIfNeeded()
  await win.screenshot({ path: `${SHOTS}/learn-math-dark.png` })

  await app.close()
})
