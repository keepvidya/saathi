import PptxGenJS from 'pptxgenjs'
import type { DeckData } from '@saathi/domain'
import type { DeckExportPort } from '../../ports/deck-export.port'

/**
 * The ONLY file allowed to import pptxgenjs (Wrapper Rule). Maps our DeckData → a real .pptx:
 * one slide per slide, a title + a bullet list. Vendor types never leak past this class.
 */
export class PptxDeckExport implements DeckExportPort {
  async toPptx(deck: DeckData): Promise<Uint8Array> {
    const pptx = new PptxGenJS()
    pptx.author = 'Saathi'
    for (const slide of deck.slides) {
      const s = pptx.addSlide()
      s.addText(slide.title, { x: 0.5, y: 0.3, w: 9, h: 1, fontSize: 28, bold: true })
      const bullets = slide.bullets.filter((b) => b.trim() !== '')
      if (bullets.length) {
        s.addText(
          bullets.map((text) => ({ text, options: { bullet: true } })),
          { x: 0.7, y: 1.6, w: 8.6, h: 4, fontSize: 18 },
        )
      }
    }
    const out = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer
    return new Uint8Array(out)
  }
}
