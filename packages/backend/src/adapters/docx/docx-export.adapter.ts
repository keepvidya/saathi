import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import type { Block, DocData, Run } from '@saathi/domain'
import type { DocExportPort } from '../../ports/doc-export.port'

/**
 * The ONLY file allowed to import `docx` (Wrapper Rule). Maps our DocData to a real .docx:
 * h1/h2 → heading paragraphs, runs → TextRuns with bold/italic/underline. Vendor types never leak.
 */
const HEADING = { h1: HeadingLevel.HEADING_1, h2: HeadingLevel.HEADING_2 } as const

function toRun(run: Run): TextRun {
  const marks = run.marks ?? []
  return new TextRun({
    text: run.text,
    bold: marks.includes('bold'),
    italics: marks.includes('italic'),
    underline: marks.includes('underline') ? {} : undefined,
  })
}

function toParagraph(block: Block): Paragraph {
  const children = block.runs.map(toRun)
  if (block.type === 'p') return new Paragraph({ children })
  return new Paragraph({ heading: HEADING[block.type], children })
}

export class DocxDocExport implements DocExportPort {
  async toDocx(doc: DocData): Promise<Uint8Array> {
    const document = new Document({
      creator: 'Saathi',
      sections: [{ children: doc.blocks.map(toParagraph) }],
    })
    const buf = await Packer.toBuffer(document)
    return new Uint8Array(buf)
  }
}
