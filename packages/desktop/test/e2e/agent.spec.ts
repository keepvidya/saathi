import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/17-agent/screenshots'

/** TC-17.3.1 — Agent: a goal → the supervisor delegates to a worker → exact answer. */
test('TC-17.3 — Agent: goal → trace → answer', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="agent"]')
  await expect(win.locator('.agent')).toBeVisible()

  await win.fill('#ag-in', '12.5 * (8 + 4)')
  await win.press('#ag-in', 'Enter')

  await expect(win.locator('.ag-step.ph-act .ag-chip').first()).toHaveText('calc')
  await expect(win.locator('.ag-answer')).toContainText('150')
  await win.screenshot({ path: `${SHOTS}/agent-light.png` })

  // a second, knowledge goal
  await win.fill('#ag-in', 'what is photosynthesis?')
  await win.press('#ag-in', 'Enter')
  await expect(win.locator('.ag-answer')).toContainText('Photosynthesis', { ignoreCase: true })

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await win.screenshot({ path: `${SHOTS}/agent-dark.png` })

  await app.close()
})
