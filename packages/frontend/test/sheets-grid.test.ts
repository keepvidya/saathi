import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderSheets } from '../src/panes/office/sheets-grid'

const cell = (host: HTMLElement, ref: string) =>
  host.querySelector<HTMLElement>(`td[data-ref="${ref}"]`)!

describe('TC-02.2.2 — Sheets grid', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
    renderSheets(host)
  })
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).saathi
  })

  it('renders headers + budget data; E2 shows the computed total; header row present (frozen)', () => {
    expect(host.querySelector('.grid thead th:nth-child(2)')?.textContent).toBe('A')
    expect(host.querySelectorAll('.grid thead th').length).toBeGreaterThan(1) // frozen header row
    expect(cell(host, 'A1').textContent).toBe('Item')
    expect(cell(host, 'E2').textContent).toBe('447')
  })

  it('editing B2 recomputes the dependent total live', () => {
    const b2 = cell(host, 'B2')
    b2.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(b2.textContent).toBe('120') // shows the raw value while editing
    b2.textContent = '100'
    b2.dispatchEvent(new Event('input', { bubbles: true }))
    b2.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    expect(cell(host, 'E2').textContent).toBe('427') // =SUM(100,150,177)
    expect(cell(host, 'B4').textContent).toBe('20') // =B2-B3 = 100-80
  })

  it('formula bar shows the active cell raw formula', () => {
    cell(host, 'E2').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(host.querySelector<HTMLInputElement>('#fin')!.value).toBe('=SUM(B2:D2)')
    expect(host.querySelector('#fref')!.textContent).toBe('E2')
  })

  it('Download .xlsx invokes the bridge with the sheet data', async () => {
    const exportXlsx = vi.fn().mockResolvedValue({ saved: true, path: 'C:/Budget.xlsx' })
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, sheet: { exportXlsx } }
    host.querySelector<HTMLElement>('#xlsx-dl')!.click()
    await new Promise((r) => setTimeout(r, 0))
    expect(exportXlsx).toHaveBeenCalledOnce()
    const data = exportXlsx.mock.calls[0][0]
    expect(data.cells.E2).toBe('=SUM(B2:D2)')
  })
})
