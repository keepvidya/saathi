import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/21-onboarding/screenshots'
const lightTheme = () => {
  document.documentElement.style.cssText = ''
  document.documentElement.removeAttribute('data-theme')
}
const darkTheme = () => {
  document.documentElement.style.cssText = ''
  document.documentElement.setAttribute('data-theme', 'dark')
}

/** TC-21.3.1 — first-run wizard: name → run-mode (hardware check) → finish → app.
 *  Uses the Heavy (cloud) path so it never triggers a real Ollama/Shiva install. */
test('TC-21.3 — onboarding (hardware check) → app', async () => {
  const app = await electron.launch({ args: ['.', '--force-onboarding'] })
  const win = await app.firstWindow()

  await expect(win.locator('.onb')).toBeVisible()
  await win.fill('#onb-name', 'Gunjan')
  await win.click('#onb-primary') // → run-mode (hardware-checked)

  // the mode step shows the real RAM check + the three Shiva/cloud modes
  await expect(win.locator('.onb-p')).toContainText('GB RAM')
  await expect(win.locator('.onb-opt.mode[data-mode="lite"]')).toBeVisible()
  await win.evaluate(lightTheme)
  await win.screenshot({ path: `${SHOTS}/onboarding-light.png` })
  await win.evaluate(darkTheme)
  await win.screenshot({ path: `${SHOTS}/onboarding-dark.png` })
  await win.evaluate(lightTheme)

  // Heavy avoids a live model download
  await win.locator('input[name="onb-mode"][value="heavy"]').check()
  await win.click('#onb-primary') // → embedding
  await win.click('#onb-primary') // → cloud key step (heavy)
  await win.click('#onb-primary') // Finish (no key)

  await expect(win.locator('.rail')).toBeVisible({ timeout: 10000 })
  await expect(win.locator('.onb')).toHaveCount(0)

  await app.close()
})
