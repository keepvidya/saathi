import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/08-chat/screenshots'

/** TC-08.3.1 — Chat send → reply (Ollama not running in CI → deterministic Echo). */
test('TC-08.3 — Chat: send a message, get a reply', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="chat"]') // Chat is the default pane
  await expect(win.locator('.chat')).toBeVisible()

  await win.fill('#chat-in', 'Hello Saathi')
  await win.press('#chat-in', 'Enter')

  await expect(win.locator('.msg.user', { hasText: 'Hello Saathi' })).toBeVisible()
  await expect(win.locator('.msg.bot').last()).toContainText('You said')
  await win.screenshot({ path: `${SHOTS}/chat-light.png` })

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await win.screenshot({ path: `${SHOTS}/chat-dark.png` })

  await app.close()
})
