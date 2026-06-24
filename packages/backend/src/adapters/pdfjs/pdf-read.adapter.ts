// The ONLY file allowed to import pdfjs-dist (Wrapper Rule / vendor-only-in-adapter).
// pdfjs-dist v4 is ESM-only; the Electron main bundle is CJS. A static import would
// become a require() of an .mjs file and crash at startup, so we load it lazily via
// dynamic import() — which bridges CJS→ESM and defers the cost to first use.
import type { PdfReadPort } from '../../ports/pdf-read.port'

type GetDocument = (src: {
  data: Uint8Array
  useSystemFonts?: boolean
  isEvalSupported?: boolean
}) => { promise: Promise<PdfDocument> }

interface PdfDocument {
  numPages: number
  getPage(n: number): Promise<PdfPage>
  destroy(): Promise<void>
}
interface PdfPage {
  getTextContent(): Promise<{ items: Array<{ str?: string }> }>
}

let loader: Promise<GetDocument> | undefined
async function getDocumentFn(): Promise<GetDocument> {
  // The `legacy` build is the one that runs under Node (no DOM, no worker).
  loader ??= import('pdfjs-dist/legacy/build/pdf.mjs').then(
    (m) => (m as { getDocument: GetDocument }).getDocument,
  )
  return loader
}

/** Real PDF text extraction behind `PdfReadPort`, via pdf.js. `''` on any failure. */
export class PdfJsRead implements PdfReadPort {
  async extractText(bytes: Uint8Array): Promise<string> {
    try {
      const getDocument = await getDocumentFn()
      // pdf.js mutates the buffer it's given — hand it a private copy.
      const data = new Uint8Array(bytes)
      const doc = await getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise

      const pages: string[] = []
      for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p)
        const content = await page.getTextContent()
        pages.push(content.items.map((item) => item.str ?? '').join(' '))
      }
      await doc.destroy()
      return pages.join('\n').replace(/[ \t]+/g, ' ').trim()
    } catch {
      return ''
    }
  }
}
