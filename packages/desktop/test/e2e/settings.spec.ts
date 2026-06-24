import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/20-settings/screenshots'

/** TC-20.3.1 — Settings: name + provider + an encrypted key (set/has/clear, never shown). */
test('TC-20.3 — Settings: profile, provider, encrypted key', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="settings"]')
  await expect(win.locator('.settings')).toBeVisible()

  await win.fill('#set-name', 'Gunjan')
  await win.locator('#set-llm input[value="cloud"]').check()
  await expect(win.locator('#set-llm-key')).toBeVisible()

  // save a key → presence shows "Set"; the value is never rendered
  const keyBox = win.locator('.set-key').first()
  await keyBox.locator('.set-key-input').fill('sk-test-key-123')
  await keyBox.locator('.set-key-save').click()
  await expect(keyBox.locator('.set-key-status')).toContainText('Set')
  await expect(win.locator('.settings')).not.toContainText('sk-test-key-123')
  await win.screenshot({ path: `${SHOTS}/settings-light.png` })

  // clear it
  await keyBox.locator('.set-key-remove').click()
  await expect(keyBox.locator('.set-key-status')).toHaveText('Not set')

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await win.screenshot({ path: `${SHOTS}/settings-dark.png` })

  await app.close()
})
