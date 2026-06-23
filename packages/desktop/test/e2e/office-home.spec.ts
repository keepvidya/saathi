import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/06-office-home/screenshots'

/** TC-06.2.1 — Office home → editor → back. */
test('TC-06.2 — Office launchpad: home → editor → back', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="office"]')
  // the staged home is visible
  await expect(win.locator('.ohome-title')).toHaveText('Office')
  await expect(win.locator('#oh-create .oh-card')).toHaveCount(3)
  await win.screenshot({ path: `${SHOTS}/home-light.png` })

  // pick Presentation → slide editor
  await win.click('#oh-create .oh-card[data-kind="slides"]')
  await expect(win.locator('.slide-canvas')).toBeVisible()

  // back to the home
  await win.click('#oback')
  await expect(win.locator('.ohome-title')).toBeVisible()

  await app.close()
})
