import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/14-learn-run/screenshots'

/** TC-14.3.1 — Learn: run a Python snippet locally (Pyodide in main) and see real output. */
test('TC-14.3 — Learn: run a Python snippet, see real output', async () => {
  test.setTimeout(120000) // first run cold-loads Pyodide in the main process
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="learn"]')
  await expect(win.locator('.learn')).toBeVisible()

  const runBtn = win.locator('.lsn-run').first()
  await runBtn.scrollIntoViewIfNeeded()
  await runBtn.click()

  // sampleLesson prints add(2, 3) === 5 — wait for Pyodide to load + run.
  const out = win.locator('.lsn-run-out').first()
  await expect(out).toContainText('5', { timeout: 90000 })
  await out.scrollIntoViewIfNeeded()
  await win.screenshot({ path: `${SHOTS}/learn-run-light.png` })

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await out.scrollIntoViewIfNeeded()
  await win.screenshot({ path: `${SHOTS}/learn-run-dark.png` })

  await app.close()
})
