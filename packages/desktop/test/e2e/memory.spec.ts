import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/18-memory/screenshots'

/** TC-18.3.1 — Memory: save a note, then recall it by search (real JsonMemory in main). */
test('TC-18.3 — Memory: save → recall', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="memory"]')
  await expect(win.locator('.memory')).toBeVisible()

  // unique text so reruns don't collide in the persisted store
  const note = `Project Saathi ships milestone ${Date.now()}`
  await win.fill('#mem-text', note)
  await win.click('#mem-save')
  await expect(win.locator('.mem-item-text').filter({ hasText: note })).toBeVisible()
  await win.screenshot({ path: `${SHOTS}/memory-light.png` })

  // recall by a keyword
  await win.fill('#mem-q', 'saathi')
  await expect(win.locator('.mem-item-text').filter({ hasText: note })).toBeVisible()
  // forget it (clean up the persisted store)
  await win.locator('.mem-item').filter({ hasText: note }).locator('.mem-forget').click()
  await expect(win.locator('.mem-item-text').filter({ hasText: note })).toHaveCount(0)

  await win.fill('#mem-text', 'Dark-mode note for the screenshot')
  await win.click('#mem-save')
  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await win.screenshot({ path: `${SHOTS}/memory-dark.png` })
  await win.locator('.mem-item').filter({ hasText: 'Dark-mode note' }).locator('.mem-forget').click()

  await app.close()
})
