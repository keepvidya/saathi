import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/05-expert-agents/screenshots'

/** TC-05.3.1 — Office AI build end-to-end (deterministic fallback; Ollama not running in CI). */
test('TC-05.3 — Office AI build: brief → agents → editable draft', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="office"]')
  await win.click('.oh-card[data-kind="sheets"]')
  await win.click('.otab[data-kind="slides"]')

  await win.fill('#ob-input', 'Series A pitch')
  await win.click('#ob-build')

  // the ReAct step log appears (agents working)
  await expect(win.locator('.bl-step').first()).toBeVisible()
  await win.screenshot({ path: `${SHOTS}/agent-build-log.png` })

  // then the built deck loads into the editor, editable
  await expect(win.locator('.slide-canvas .slide-title')).toHaveText('Series A pitch')
  await win.screenshot({ path: `${SHOTS}/agent-build-result.png` })

  await app.close()
})
