import { describe, expect, it } from 'vitest'
import JSZip from 'jszip'
import { sampleDeck } from '@saathi/domain'
import { PptxDeckExport } from '../src/adapters/pptxgenjs/pptx-export.adapter'

describe('TC-04.2.1 — pptx export round-trips', () => {
  it('produces a valid .pptx whose slide XML carries the title + a bullet', async () => {
    const bytes = await new PptxDeckExport().toPptx(sampleDeck())
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes.byteLength).toBeGreaterThan(0)
    expect(bytes[0]).toBe(0x50) // 'P'
    expect(bytes[1]).toBe(0x4b) // 'K' — zip magic

    const zip = await JSZip.loadAsync(bytes)
    const xml = await zip.file('ppt/slides/slide1.xml')!.async('string')
    expect(xml).toContain('Q3 Investor Update')
    expect(xml).toContain('Gross margin held at 71%')
  })
})
