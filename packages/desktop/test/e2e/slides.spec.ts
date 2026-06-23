import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/04-office-slides/screenshots'

/** TC-04.3.* — Office Slides: render, switch slides, switch editors, export control. */
test('TC-04.3 — Office Slides render, switch, export', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="office"]')
  await win.click('.oh-card[data-kind="sheets"]')
  await win.click('.otab[data-kind="slides"]')
  await expect(win.locator('.slide-canvas .slide-title')).toHaveText('Q3 Investor Update')
  await expect(win.locator('#pptx-dl')).toBeVisible()
  await win.screenshot({ path: `${SHOTS}/slides-light.png` })

  // switch to slide 2
  await win.click('.slide-thumb[data-i="1"]')
  await expect(win.locator('.slide-canvas .slide-title')).toHaveText('Growth')

  // editors still work
  await win.click('.otab[data-kind="sheets"]')
  await expect(win.locator('td[data-ref="E2"]')).toHaveText('447')
  await win.click('.otab[data-kind="docs"]')
  await expect(win.locator('.docpage h1')).toHaveText('Project Proposal')

  // dark artifact on slides
  await win.click('.otab[data-kind="slides"]')
  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await win.screenshot({ path: `${SHOTS}/slides-dark.png` })

  await app.close()
})
