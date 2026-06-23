/** A document as a pure, serializable block model. No DOM/IO. */
export type Mark = 'bold' | 'italic' | 'underline'
export interface Run {
  text: string
  marks?: Mark[]
}
export type BlockType = 'h1' | 'h2' | 'p'
export interface Block {
  type: BlockType
  runs: Run[]
}
export interface DocData {
  blocks: Block[]
}

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

function runHtml(run: Run): string {
  let h = esc(run.text)
  const marks = run.marks ?? []
  if (marks.includes('underline')) h = `<u>${h}</u>`
  if (marks.includes('italic')) h = `<em>${h}</em>`
  if (marks.includes('bold')) h = `<strong>${h}</strong>`
  return h
}

/** Render the document to safe HTML (all text escaped). */
export function docToHtml(doc: DocData): string {
  return doc.blocks
    .map((b) => {
      const inner = b.runs.map(runHtml).join('')
      return `<${b.type}>${inner || '<br>'}</${b.type}>`
    })
    .join('')
}

/** Concatenated plain text (for assertions / search). */
export function docPlainText(doc: DocData): string {
  return doc.blocks.map((b) => b.runs.map((r) => r.text).join('')).join('\n')
}

/** The M3 fixture: a "Project Proposal" with a heading and a bold run. */
export function sampleDoc(): DocData {
  return {
    blocks: [
      { type: 'h1', runs: [{ text: 'Project Proposal' }] },
      {
        type: 'p',
        runs: [
          { text: 'Prepared by Saathi — ' },
          { text: 'local-first', marks: ['bold'] },
          { text: ' and private.' },
        ],
      },
      { type: 'h2', runs: [{ text: 'Summary' }] },
      { type: 'p', runs: [{ text: 'This proposal outlines the plan, scope, and timeline.' }] },
    ],
  }
}
