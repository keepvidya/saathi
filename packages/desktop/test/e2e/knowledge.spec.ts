import { test, expect, _electron as electron } from '@playwright/test'

const SHOTS = '../../docs/features/09-knowledge-rag/screenshots'

/** TC-09.3.1 — Knowledge: add a document → ask → grounded, cited answer. */
test('TC-09.3 — Knowledge: add → ask → cited answer', async () => {
  const app = await electron.launch({ args: ['.'] })
  const win = await app.firstWindow()

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="light"]')

  await win.click('[data-pane="knowledge"]')
  await expect(win.locator('.knowledge')).toBeVisible()

  // Add a document.
  await win.fill('#kn-title', 'Plant Biology')
  await win.fill(
    '#kn-text',
    'Photosynthesis converts sunlight into chemical energy in green plants. ' +
      'Chlorophyll absorbs the light that powers the reaction.',
  )
  await win.click('#kn-add')
  await expect(win.locator('.kn-doc', { hasText: 'Plant Biology' })).toBeVisible()

  // Ask about it → grounded answer + a citation to the source doc.
  await win.fill('#kn-query', 'what does photosynthesis convert sunlight into')
  await win.press('#kn-query', 'Enter')

  await expect(win.locator('.kn-a')).toContainText('photosynthesis', { ignoreCase: true })
  await expect(win.locator('.kn-cite').first()).toContainText('Plant Biology')
  await win.screenshot({ path: `${SHOTS}/knowledge-light.png` })

  await win.click('#theme-gallery-btn')
  await win.click('[data-skin="dark"]')
  await expect(win.locator('html')).toHaveAttribute('data-theme', 'dark')
  await win.screenshot({ path: `${SHOTS}/knowledge-dark.png` })

  await app.close()
})
