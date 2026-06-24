import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/21-onboarding/screenshots'

/** TC-21.3.1 — first-run wizard (forced) → step through → the app mounts. */
test('TC-21.3 — onboarding wizard → app', async () => {
  const app = await electron.launch({ args: ['.', '--force-onboarding'] })
  const win = await app.firstWindow()

  await expect(win.locator('.onb')).toBeVisible()
  await expect(win.locator('.onb-h')).toContainText("I'm Saathi")

  await win.fill('#onb-name', 'Gunjan')
  // setSkin applies inline CSS vars; clear them so the data-theme CSS blocks drive the theme.
  await win.evaluate(() => {
    document.documentElement.style.cssText = ''
    document.documentElement.removeAttribute('data-theme') // :root = light
  })
  await win.screenshot({ path: `${SHOTS}/onboarding-light.png` })
  await win.evaluate(() => {
    document.documentElement.style.cssText = ''
    document.documentElement.setAttribute('data-theme', 'dark')
  })
  await win.screenshot({ path: `${SHOTS}/onboarding-dark.png` })
  await win.evaluate(() => document.documentElement.removeAttribute('data-theme'))

  await win.click('#onb-primary') // → AI provider (offline default)
  await expect(win.locator('.onb-h')).toContainText('How should I think')
  await win.click('#onb-primary') // → search (none default)
  await win.click('#onb-primary') // → done
  await expect(win.locator('.onb-h')).toContainText('Gunjan') // "You're all set, Gunjan."
  await win.click('#onb-primary') // Finish

  // the app shell mounts
  await expect(win.locator('.rail')).toBeVisible({ timeout: 10000 })
  await expect(win.locator('.onb')).toHaveCount(0)

  await app.close()
})
