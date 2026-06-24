import { describe, expect, it } from 'vitest'
import type { DocData } from '@saathi/domain'
import { PdfLibDocExport } from '../src/adapters/pdf-lib/pdf-export.adapter'
import { PdfJsRead } from '../src/adapters/pdfjs/pdf-read.adapter'

describe('TC-09.2.1 — pdf.js extracts text (round-trip with our pdf-lib adapter)', () => {
  it('reads back a known phrase from a PDF we generated', async () => {
    const doc: DocData = {
      blocks: [
        { type: 'h1', runs: [{ text: 'Knowledge base phrase' }] },
        { type: 'p', runs: [{ text: 'Photosynthesis converts sunlight into chemical energy.' }] },
      ],
    }
    const bytes = await new PdfLibDocExport().toPdf(doc)

    const text = await new PdfJsRead().extractText(bytes)
    expect(text).toContain('Knowledge base phrase')
    expect(text).toContain('Photosynthesis')
  }, 20000)

  it('returns "" on invalid bytes (no crash)', async () => {
    const text = await new PdfJsRead().extractText(new Uint8Array([1, 2, 3, 4]))
    expect(text).toBe('')
  }, 20000)
})
