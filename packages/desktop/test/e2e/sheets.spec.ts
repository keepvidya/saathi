import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/02-office-sheets/screenshots'

/** TC-02.3.* — Office Sheets: see data, live recompute, export control present. */
test('TC-02.3 — Sheets: data, live recompute, export', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  // deterministic light theme for the light artifact (prior specs may persist a theme)
  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'light')

  // TC-02.3.1 — open Office (Sheets) and see the budget
  await win.click('[data-pane="office"]')
  await win.click('.oh-card[data-kind="sheets"]')
  await expect(win.locator('.sheets')).toBeVisible()
  await expect(win.locator('td[data-ref="A1"]')).toHaveText('Item')
  await expect(win.locator('td[data-ref="E2"]')).toHaveText('447')
  await win.screenshot({ path: `${SHOTS}/sheets-light.png` })

  // TC-02.3.2 — live recompute: change B2 to 100 → total becomes 427
  const b2 = win.locator('td[data-ref="B2"]')
  await b2.click()
  await win.keyboard.press('Control+A')
  await win.keyboard.type('100')
  await win.keyboard.press('Enter')
  await expect(win.locator('td[data-ref="E2"]')).toHaveText('427')

  // TC-02.3.3 — export control present & wired
  await expect(win.locator('#xlsx-dl')).toBeVisible()

  // dark-theme visual artifact
  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await win.screenshot({ path: `${SHOTS}/sheets-dark.png` })

  await app.close()
})
