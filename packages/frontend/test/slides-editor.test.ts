import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderSlides } from '../src/panes/office/slides-editor'

describe('TC-04.2.2 — Slides editor', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
    renderSlides(host)
  })
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).saathi
  })

  it('renders the first slide + a 3-thumb strip with an add button', () => {
    expect(host.querySelector('.slide-canvas .slide-title')?.textContent).toBe('Q3 Investor Update')
    expect(host.querySelectorAll('.slide-strip .slide-thumb[data-i]').length).toBe(3)
    expect(host.querySelector('.slide-thumb.add')).toBeTruthy()
  })

  it('switches slides via the strip', () => {
    host.querySelector<HTMLElement>('.slide-thumb[data-i="1"]')!.click()
    expect(host.querySelector('.slide-title')?.textContent).toBe('Growth')
  })

  it('adds a new slide and makes it active', () => {
    host.querySelector<HTMLElement>('[data-add]')!.click()
    expect(host.querySelectorAll('.slide-thumb[data-i]').length).toBe(4)
    expect(host.querySelector('.slide-title')?.textContent).toBe('New slide')
  })

  it('Download .pptx exports the edited deck via the bridge', async () => {
    const exportPptx = vi.fn().mockResolvedValue({ saved: true, path: 'C:/Deck.pptx' })
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, slide: { exportPptx } }
    host.querySelector<HTMLElement>('.slide-title')!.textContent = 'Edited Title'
    host.querySelector<HTMLElement>('#pptx-dl')!.click()
    await new Promise((r) => setTimeout(r, 0))
    expect(exportPptx).toHaveBeenCalledOnce()
    expect(exportPptx.mock.calls[0][0].slides[0].title).toBe('Edited Title')
  })
})
