import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/15-browser/screenshots'
const PAGE = 'data:text/html,<title>Hello Saathi</title><h1>Hello</h1>'

/** TC-15.3.1 — Browser: open, navigate (no network), multi-tab. */
test('TC-15.3 — Browser: navigate + multi-tab', async () => {
  test.setTimeout(60000)
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="browser"]')
  await expect(win.locator('.browser')).toBeVisible()
  // entering the pane opens the first tab
  await expect(win.locator('.br-tab')).toHaveCount(1, { timeout: 15000 })

  // navigate the active tab to a titled data: page (no external network)
  await win.fill('#br-address', PAGE)
  await win.press('#br-address', 'Enter')
  await expect(win.locator('.br-tab.active .br-tab-t')).toHaveText('Hello Saathi', {
    timeout: 20000,
  })
  await win.screenshot({ path: `${SHOTS}/browser-light.png` })

  // open a second tab, then close it
  await win.click('#br-newtab')
  await expect(win.locator('.br-tab')).toHaveCount(2)
  await win.locator('.br-tab').nth(1).locator('.br-tab-x').click()
  await expect(win.locator('.br-tab')).toHaveCount(1)

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await win.screenshot({ path: `${SHOTS}/browser-dark.png` })

  await app.close()
})
