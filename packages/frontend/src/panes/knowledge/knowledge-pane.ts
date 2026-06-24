import { Corpus, retrieve, composeAnswer, markdownToHtml, type Citation } from '@saathi/domain'
import { bridge } from '../../bridge/saathi.bridge'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

let docSeq = 0
const nextId = (): string => `kdoc-${++docSeq}`

/**
 * The Knowledge pane: ingest documents (paste text or upload a PDF), then ask
 * questions and get a deterministic, **cited** answer. Retrieval + the answer
 * are computed by our domain engine — no facts are invented (DNA).
 */
export function renderKnowledge(host: HTMLElement): void {
  const corpus = new Corpus()

  // A friendly first-run example so the pane is never empty.
  corpus.add({
    id: nextId(),
    title: 'About Saathi',
    text:
      'Saathi is a local-first AI workspace. Your documents and chats stay on your machine. ' +
      'The Knowledge tool reads your documents and answers questions with citations, so every ' +
      'answer can be traced back to the source text. Nothing is uploaded to the cloud.',
  })

  host.innerHTML = `<div class="knowledge" data-pane="knowledge">
    <div class="kn-head">
      <h1 class="kn-title">Knowledge</h1>
      <p class="kn-sub">Ask your own documents — answers are drawn from your text and <strong>cited</strong>. Runs on your machine.</p>
    </div>
    <div class="kn-body">
      <aside class="kn-side">
        <div class="kn-add">
          <input id="kn-title" class="kn-input" placeholder="Document title" />
          <textarea id="kn-text" class="kn-area" rows="5" placeholder="Paste text to add to your knowledge base…"></textarea>
          <div class="kn-add-row">
            <button id="kn-add" class="kn-btn primary">Add document</button>
            <button id="kn-upload" class="kn-btn">Upload PDF</button>
            <input id="kn-file" type="file" accept="application/pdf" hidden />
          </div>
          <p id="kn-note" class="kn-note" hidden></p>
        </div>
        <div class="kn-docs-h">Your documents</div>
        <ul id="kn-docs" class="kn-docs"></ul>
      </aside>
      <section class="kn-main">
        <div id="kn-answer" class="kn-answer"></div>
        <div class="kn-ask">
          <div class="cbox">
            <input id="kn-query" placeholder="Ask a question about your documents…" />
            <button id="kn-ask" class="send" aria-label="Ask">↑</button>
          </div>
        </div>
      </section>
    </div>
  </div>`

  const $ = <T extends HTMLElement>(sel: string): T => host.querySelector<T>(sel)!
  const titleEl = $<HTMLInputElement>('#kn-title')
  const textEl = $<HTMLTextAreaElement>('#kn-text')
  const docsEl = $<HTMLUListElement>('#kn-docs')
  const queryEl = $<HTMLInputElement>('#kn-query')
  const answerEl = $<HTMLElement>('#kn-answer')
  const noteEl = $<HTMLElement>('#kn-note')

  const note = (msg: string): void => {
    noteEl.textContent = msg
    noteEl.hidden = !msg
  }

  const drawDocs = (): void => {
    const docs = corpus.docList()
    docsEl.innerHTML = docs
      .map((d) => `<li class="kn-doc"><span class="kn-doc-dot"></span>${esc(d.title)}</li>`)
      .join('')
  }

  const citationsHtml = (citations: Citation[]): string =>
    citations.length === 0
      ? ''
      : `<div class="kn-cites">${citations
          .map(
            (c) =>
              `<div class="kn-cite"><span class="kn-cite-n">${c.n}</span>` +
              `<span class="kn-cite-body"><strong>${esc(c.docTitle)}</strong>` +
              `<span class="kn-cite-snip">${esc(c.snippet)}</span></span></div>`,
          )
          .join('')}</div>`

  const emptyAnswer = (): void => {
    answerEl.innerHTML = `<div class="kn-empty">Add a document, then ask a question. Answers quote your text and cite the source.</div>`
  }

  function ask(): void {
    const q = queryEl.value.trim()
    if (!q) return
    const hits = retrieve(corpus, q, 4)
    const { answer, citations } = composeAnswer(q, hits)
    answerEl.innerHTML =
      `<div class="kn-q">${esc(q)}</div>` +
      `<div class="kn-a">${markdownToHtml(answer)}</div>` +
      citationsHtml(citations)
    answerEl.scrollTop = 0
  }

  function addText(): void {
    const text = textEl.value.trim()
    if (!text) {
      note('Paste some text first.')
      return
    }
    const title = titleEl.value.trim() || `Document ${corpus.docList().length + 1}`
    corpus.add({ id: nextId(), title, text })
    titleEl.value = ''
    textEl.value = ''
    note('')
    drawDocs()
  }

  async function uploadPdf(file: File): Promise<void> {
    note('Reading PDF…')
    const bytes = new Uint8Array(await file.arrayBuffer())
    const text = await bridge.extractPdfText(bytes)
    if (!text) {
      note('Couldn’t read that PDF (is it text, not scanned?).')
      return
    }
    corpus.add({ id: nextId(), title: file.name.replace(/\.pdf$/i, ''), text })
    note('')
    drawDocs()
  }

  $('#kn-add').addEventListener('click', addText)
  $('#kn-ask').addEventListener('click', ask)
  queryEl.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') {
      e.preventDefault()
      ask()
    }
  })
  const fileEl = $<HTMLInputElement>('#kn-file')
  $('#kn-upload').addEventListener('click', () => fileEl.click())
  fileEl.addEventListener('change', () => {
    const f = fileEl.files?.[0]
    if (f) void uploadPdf(f)
    fileEl.value = ''
  })

  drawDocs()
  emptyAnswer()
}
