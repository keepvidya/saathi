import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { DocData } from '@saathi/domain'
import type { PdfExportPort } from '../../ports/pdf-export.port'

const A4: [number, number] = [595, 842]
const MARGIN = 56
const INK = rgb(0.106, 0.165, 0.2) // #1B2A33
const SIZES = { h1: 22, h2: 15, p: 11 } as const

/** Keep text within the standard font's encoding (avoid pdf-lib throwing on odd unicode). */
const clean = (s: string): string =>
  s
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E]/g, '?')

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return ['']
  const lines: string[] = []
  let line = words[0]
  for (const w of words.slice(1)) {
    const next = `${line} ${w}`
    if (font.widthOfTextAtSize(next, size) > maxWidth) {
      lines.push(line)
      line = w
    } else line = next
  }
  lines.push(line)
  return lines
}

/**
 * The ONLY file allowed to import pdf-lib (Wrapper Rule). Lays out DocData onto A4 pages with
 * word-wrap + pagination. Vendor types never leak past this class.
 */
export class PdfLibDocExport implements PdfExportPort {
  async toPdf(doc: DocData): Promise<Uint8Array> {
    const pdf = await PDFDocument.create()
    pdf.setCreator('Saathi')
    const regular = await pdf.embedFont(StandardFonts.Helvetica)
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
    const width = A4[0] - MARGIN * 2

    let page: PDFPage = pdf.addPage(A4)
    let y = A4[1] - MARGIN

    for (const block of doc.blocks) {
      const size = SIZES[block.type]
      const font = block.type === 'p' ? regular : bold
      const text = clean(block.runs.map((r) => r.text).join(''))
      for (const line of wrap(text, font, size, width)) {
        if (y - size < MARGIN) {
          page = pdf.addPage(A4)
          y = A4[1] - MARGIN
        }
        page.drawText(line, { x: MARGIN, y: y - size, size, font, color: INK })
        y -= size * 1.5
      }
      y -= block.type === 'p' ? 6 : 10
    }

    return pdf.save({ useObjectStreams: false })
  }
}
