import { describe, expect, it } from 'vitest'
import JSZip from 'jszip'
import { sampleDoc } from '@saathi/domain'
import { DocxDocExport } from '../src/adapters/docx/docx-export.adapter'

describe('TC-03.2.1 — docx export round-trips', () => {
  it('produces a valid .docx whose text + bold run survive', async () => {
    const bytes = await new DocxDocExport().toDocx(sampleDoc())
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes.byteLength).toBeGreaterThan(0)
    expect(bytes[0]).toBe(0x50) // 'P'
    expect(bytes[1]).toBe(0x4b) // 'K' — zip magic

    const zip = await JSZip.loadAsync(bytes)
    const xml = await zip.file('word/document.xml')!.async('string')
    expect(xml).toContain('Project Proposal')
    expect(xml).toContain('local-first')
    expect(xml).toMatch(/<w:b\b/) // a bold run property
  })
})
