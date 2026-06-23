import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/03-office-docs/screenshots'

/** TC-03.3.* — Office Docs: render, switch Sheets↔Docs, export control present. */
test('TC-03.3 — Office Docs render, switch, export', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  // deterministic light theme for the artifact
  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="office"]')
  await win.click('.oh-card[data-kind="sheets"]')
  await expect(win.locator('.sheets')).toBeVisible() // default = Sheets

  // switch to Docs
  await win.click('.otab[data-kind="docs"]')
  await expect(win.locator('.docpage h1')).toHaveText('Project Proposal')
  await expect(win.locator('#docx-dl')).toBeVisible()
  await expect(win.locator('#pdf-dl')).toBeVisible() // TC-07.3.1 — PDF export control
  await win.screenshot({ path: `${SHOTS}/docs-light.png` })

  // switch back to Sheets — M2 intact
  await win.click('.otab[data-kind="sheets"]')
  await expect(win.locator('td[data-ref="E2"]')).toHaveText('447')

  // dark artifact on Docs
  await win.click('.otab[data-kind="docs"]')
  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await win.screenshot({ path: `${SHOTS}/docs-dark.png` })

  await app.close()
})
