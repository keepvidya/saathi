import { sampleDoc, docToHtml, type DocData, type Block, type BlockType, type Mark, type Run } from '@saathi/domain'
import { bridge } from '../../bridge/saathi.bridge'

const sameMarks = (a?: Mark[], b?: Mark[]): boolean => {
  const x = [...(a ?? [])].sort().join(',')
  const y = [...(b ?? [])].sort().join(',')
  return x === y
}

/** Merge adjacent runs that carry identical marks (keeps the model tidy). */
function mergeRuns(runs: Run[]): Run[] {
  const out: Run[] = []
  for (const r of runs) {
    const last = out[out.length - 1]
    if (last && sameMarks(last.marks, r.marks)) last.text += r.text
    else out.push({ text: r.text, ...(r.marks && r.marks.length ? { marks: r.marks } : {}) })
  }
  return out
}

function collectRuns(node: Node, marks: Set<Mark>, out: Run[]): void {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? ''
      if (text) out.push({ text, ...(marks.size ? { marks: [...marks] } : {}) })
      return
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return
    const e = child as HTMLElement
    const t = e.tagName.toLowerCase()
    if (t === 'br') return
    const next = new Set(marks)
    if (t === 'strong' || t === 'b') next.add('bold')
    if (t === 'em' || t === 'i') next.add('italic')
    if (t === 'u') next.add('underline')
    const fw = e.style?.fontWeight
    if (fw === 'bold' || fw === '700') next.add('bold')
    if (e.style?.fontStyle === 'italic') next.add('italic')
    if ((e.style?.textDecoration ?? '').includes('underline')) next.add('underline')
    collectRuns(e, next, out)
  })
}

/** Serialize a contenteditable page back into DocData (the source of truth). */
export function htmlToDoc(page: HTMLElement): DocData {
  const blocks: Block[] = []
  page.childNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const e = node as HTMLElement
    const tag = e.tagName.toLowerCase()
    const type: BlockType = tag === 'h1' ? 'h1' : tag === 'h2' ? 'h2' : 'p'
    const runs: Run[] = []
    collectRuns(e, new Set<Mark>(), runs)
    blocks.push({ type, runs: mergeRuns(runs.length ? runs : [{ text: '' }]) })
  })
  return { blocks: blocks.length ? blocks : [{ type: 'p', runs: [{ text: '' }] }] }
}

/** The Docs editor: a Word-style contenteditable page + toolbar + .docx download. */
export function renderDoc(host: HTMLElement, initial?: DocData): void {
  host.innerHTML = `
    <div class="doc">
      <div class="doc-toolbar">
        <button class="tbtn" data-cmd="bold" title="Bold"><b>B</b></button>
        <button class="tbtn" data-cmd="italic" title="Italic"><i>I</i></button>
        <button class="tbtn" data-cmd="underline" title="Underline"><u>U</u></button>
        <span class="tsep"></span>
        <button class="tbtn" data-block="h1" title="Heading 1">H1</button>
        <button class="tbtn" data-block="h2" title="Heading 2">H2</button>
        <button class="tbtn" data-block="p" title="Body">¶</button>
        <span style="flex:1"></span>
        <button class="kp-btn ghost" id="pdf-dl">⤓ PDF</button>
        <button class="kp-btn" id="docx-dl">⤓ Download .docx</button>
      </div>
      <div class="doc-scroll"><div class="docpage" id="docpage" contenteditable="true" spellcheck="false"></div></div>
    </div>`

  const page = host.querySelector<HTMLElement>('#docpage')!
  page.innerHTML = docToHtml(initial ?? sampleDoc())

  const exec = (cmd: string, val?: string): void => {
    document.execCommand('styleWithCSS', false, 'false')
    document.execCommand(cmd, false, val)
  }
  host.querySelectorAll<HTMLElement>('.tbtn[data-cmd]').forEach((b) => {
    b.addEventListener('mousedown', (e) => e.preventDefault())
    b.addEventListener('click', () => exec(b.dataset.cmd!))
  })
  host.querySelectorAll<HTMLElement>('.tbtn[data-block]').forEach((b) => {
    b.addEventListener('mousedown', (e) => e.preventDefault())
    b.addEventListener('click', () => exec('formatBlock', b.dataset.block!.toUpperCase()))
  })

  host.querySelector<HTMLElement>('#docx-dl')!.addEventListener('click', async () => {
    await bridge.exportDocx(htmlToDoc(page))
  })
  host.querySelector<HTMLElement>('#pdf-dl')!.addEventListener('click', async () => {
    await bridge.exportPdf(htmlToDoc(page))
  })
}
