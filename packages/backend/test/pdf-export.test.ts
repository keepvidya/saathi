import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { sampleDoc, type DocData } from '@saathi/domain'
import { PdfLibDocExport } from '../src/adapters/pdf-lib/pdf-export.adapter'

describe('TC-07.2.1 — pdf-lib export produces a valid PDF', () => {
  it('valid PDF, reloadable, ≥1 page, survives the em-dash', async () => {
    const bytes = await new PdfLibDocExport().toPdf(sampleDoc()) // sample has an em-dash
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes.byteLength).toBeGreaterThan(500)
    expect(String.fromCharCode(...bytes.subarray(0, 5))).toBe('%PDF-')

    const reloaded = await PDFDocument.load(bytes)
    expect(reloaded.getPageCount()).toBeGreaterThanOrEqual(1)
  })

  it('word-wraps + paginates long content across multiple pages', async () => {
    const blocks: DocData['blocks'] = [{ type: 'h1', runs: [{ text: 'Long document' }] }]
    for (let i = 0; i < 120; i++) {
      blocks.push({
        type: 'p',
        runs: [{ text: `Paragraph ${i} with enough words to fill a whole line of text on the page.` }],
      })
    }
    const bytes = await new PdfLibDocExport().toPdf({ blocks })
    const pdf = await PDFDocument.load(bytes)
    expect(pdf.getPageCount()).toBeGreaterThan(1)
  })
})
