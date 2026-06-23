import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderDoc, htmlToDoc } from '../src/panes/office/doc-editor'

describe('TC-03.1.2 — htmlToDoc serializes the page back to DocData', () => {
  it('captures headings and bold/italic/underline runs', () => {
    const page = document.createElement('div')
    page.innerHTML = '<h1>Title</h1><p>hi <strong>bold</strong></p>'
    expect(htmlToDoc(page)).toEqual({
      blocks: [
        { type: 'h1', runs: [{ text: 'Title' }] },
        { type: 'p', runs: [{ text: 'hi ' }, { text: 'bold', marks: ['bold'] }] },
      ],
    })
  })

  it('reads em/u and inline styles as marks', () => {
    const page = document.createElement('div')
    page.innerHTML =
      '<p><em>it</em><u>un</u><span style="font-weight:bold">b</span></p>'
    const doc = htmlToDoc(page)
    expect(doc.blocks[0].runs).toEqual([
      { text: 'it', marks: ['italic'] },
      { text: 'un', marks: ['underline'] },
      { text: 'b', marks: ['bold'] },
    ])
  })
})

describe('TC-03.2.2 — Docs editor renders the model', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
    renderDoc(host)
  })
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).saathi
  })

  it('renders the sample doc heading + toolbar', () => {
    expect(host.querySelector('.docpage h1')?.textContent).toBe('Project Proposal')
    expect(host.querySelectorAll('.doc-toolbar .tbtn').length).toBeGreaterThanOrEqual(6)
  })

  it('Download .docx invokes the bridge with serialized DocData', async () => {
    const exportDocx = vi.fn().mockResolvedValue({ saved: true, path: 'C:/Proposal.docx' })
    ;(globalThis as Record<string, unknown>).saathi = {
      app: { getInfo: vi.fn() },
      doc: { exportDocx, exportPdf: vi.fn() },
    }
    host.querySelector<HTMLElement>('#docx-dl')!.click()
    await new Promise((r) => setTimeout(r, 0))
    expect(exportDocx).toHaveBeenCalledOnce()
    expect(exportDocx.mock.calls[0][0].blocks[0]).toEqual({ type: 'h1', runs: [{ text: 'Project Proposal' }] })
  })

  it('Download PDF invokes the bridge with serialized DocData', async () => {
    const exportPdf = vi.fn().mockResolvedValue({ saved: true, path: 'C:/Document.pdf' })
    ;(globalThis as Record<string, unknown>).saathi = {
      app: { getInfo: vi.fn() },
      doc: { exportDocx: vi.fn(), exportPdf },
    }
    host.querySelector<HTMLElement>('#pdf-dl')!.click()
    await new Promise((r) => setTimeout(r, 0))
    expect(exportPdf).toHaveBeenCalledOnce()
    expect(exportPdf.mock.calls[0][0].blocks[0].type).toBe('h1')
  })
})
