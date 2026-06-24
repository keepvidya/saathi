import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/10-learn/screenshots'

/** TC-10.3.1 — Learn: read a lesson → answer a quiz → deterministic correct + score. */
test('TC-10.3 — Learn: render, answer a quiz, see correct + score', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="learn"]')
  await expect(win.locator('.learn')).toBeVisible()
  await expect(win.locator('.lsn-prose').first()).toBeVisible()
  await expect(win.locator('.lsn-code').first()).toBeVisible()
  await expect(win.locator('#lsn-score')).toHaveText('Score: 0 / 2')

  // Answer the first quiz correctly (sampleLesson q1 → option index 1 = "5").
  await win.click('.lsn-quiz[data-qid="q1"] .lsn-opt[data-i="1"]')
  await expect(win.locator('.lsn-quiz[data-qid="q1"] .lsn-opt.correct')).toBeVisible()
  await expect(win.locator('.lsn-quiz[data-qid="q1"] .lsn-explain')).toContainText('Correct')
  await expect(win.locator('#lsn-score')).toHaveText('Score: 1 / 2')
  await win.screenshot({ path: `${SHOTS}/learn-light.png` })

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await win.screenshot({ path: `${SHOTS}/learn-dark.png` })

  await app.close()
})
