import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/19-skills/screenshots'

/** TC-19.3.1 — Skills: run a recipe → the computed answer appears. */
test('TC-19.3 — Skills: run a skill', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="skills"]')
  await expect(win.locator('.skills')).toBeVisible()
  await expect(win.locator('.sk-card').first()).toBeVisible()

  // Tip splitter: 120 with 18% tip split 4 ways → 35.4
  const tip = win.locator('.sk-card[data-skill="tip"]')
  await tip.locator('.sk-input').fill('120, 4, 18')
  await tip.locator('.sk-run').click()
  await expect(tip.locator('.sk-answer')).toHaveText('35.4')

  // Percentage: 15% of 240 → 36
  const pct = win.locator('.sk-card[data-skill="percent"]')
  await pct.locator('.sk-input').fill('15% of 240')
  await pct.locator('.sk-run').click()
  await expect(pct.locator('.sk-answer')).toHaveText('36')
  await win.screenshot({ path: `${SHOTS}/skills-light.png` })

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await win.screenshot({ path: `${SHOTS}/skills-dark.png` })

  await app.close()
})
