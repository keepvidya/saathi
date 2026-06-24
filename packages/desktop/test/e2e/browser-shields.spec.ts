import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/16-browser-shields/screenshots'
// A page that references a known tracker; Shields cancels the request locally (no network).
const PAGE =
  'data:text/html,<title>Tracker test</title><h1>Hi</h1><img src="https://doubleclick.net/pixel.gif">'

/** TC-16.3.1 — Shields blocks a tracker (count rises) and can be toggled off. */
test('TC-16.3 — Browser Shields: blocks a tracker + toggle', async () => {
  test.setTimeout(60000)
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="browser"]')
  await expect(win.locator('.browser')).toBeVisible()
  await expect(win.locator('.br-tab')).toHaveCount(1, { timeout: 15000 })

  await win.fill('#br-address', PAGE)
  await win.press('#br-address', 'Enter')

  // the tracker request is blocked → the badge count becomes non-zero
  await expect(win.locator('#br-shield-n')).not.toHaveText('0', { timeout: 20000 })
  await win.screenshot({ path: `${SHOTS}/browser-shields-light.png` })

  // toggle Shields off → the button shows the off state
  await win.click('#br-shield')
  await expect(win.locator('#br-shield')).toHaveClass(/off/, { timeout: 10000 })

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  // turn Shields back on for the dark shot
  await win.click('#br-shield')
  await expect(win.locator('#br-shield')).not.toHaveClass(/off/)
  await win.screenshot({ path: `${SHOTS}/browser-shields-dark.png` })

  await app.close()
})
