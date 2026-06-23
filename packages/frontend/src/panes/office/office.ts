import { renderSheets } from './sheets-grid'
import { renderDoc } from './doc-editor'
import { renderSlides } from './slides-editor'
import { aiBuild, type BuiltModel } from './ai-build'
import { makeBuildLlm } from '../../agent/composite-llm'
import type { BuildType, SheetData, DocData, DeckData } from '@saathi/domain'

type OfficeKind = 'sheets' | 'docs' | 'slides'
type OfficeView = 'home' | 'editor'

let view: OfficeView = 'home'
let active: OfficeKind = 'sheets'

interface RecentItem {
  kind: OfficeKind
  name: string
}
const recent: RecentItem[] = [
  { kind: 'slides', name: 'Q3 Investor Update' },
  { kind: 'sheets', name: 'Budget' },
]

const TYPES: { kind: OfficeKind; label: string; blurb: string; icon: string }[] = [
  { kind: 'sheets', label: 'Spreadsheet', blurb: 'Formulas, live recalc, export .xlsx', icon: '▦' },
  { kind: 'docs', label: 'Document', blurb: 'Rich text, headings, export .docx', icon: '📄' },
  { kind: 'slides', label: 'Presentation', blurb: 'Slides + bullets, export .pptx', icon: '▭' },
]
const TEMPLATES: { kind: OfficeKind; name: string; desc: string }[] = [
  { kind: 'sheets', name: 'Monthly budget', desc: 'Income vs. expenses with totals' },
  { kind: 'docs', name: 'Business letter', desc: 'Formal letter layout' },
  { kind: 'slides', name: 'Pitch deck', desc: 'Title + agenda starter' },
  { kind: 'sheets', name: 'Invoice', desc: 'Line items, qty × price' },
]
const labelOf = (k: OfficeKind): string => TYPES.find((t) => t.kind === k)!.label
const iconOf = (k: OfficeKind): string => TYPES.find((t) => t.kind === k)!.icon

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

function recordRecent(kind: OfficeKind, name: string): void {
  const i = recent.findIndex((r) => r.name === name)
  if (i >= 0) recent.splice(i, 1)
  recent.unshift({ kind, name })
  if (recent.length > 6) recent.length = 6
}

function loadEditor(kind: OfficeKind, body: HTMLElement, model?: BuiltModel): void {
  if (kind === 'sheets') renderSheets(body, model as SheetData | undefined)
  else if (kind === 'docs') renderDoc(body, model as DocData | undefined)
  else renderSlides(body, model as DeckData | undefined)
}

function homeHtml(): string {
  const card = (k: OfficeKind, name: string, blurb: string, tag?: string) =>
    `<button class="oh-card${tag ? ' sm' : ''}" data-kind="${k}" data-name="${esc(name)}">
      ${tag ? `<span class="oh-tag">${tag}</span>` : `<span class="oh-ic">${iconOf(k)}</span>`}
      <b>${esc(name)}</b><span class="oh-blurb">${esc(blurb)}</span>
    </button>`
  return `<div class="ohome"><div class="pad ohome-pad">
    <h2 class="ohome-title">Office</h2>
    <p class="ohome-sub">Make a spreadsheet, document, or deck — built on your machine.</p>
    <span class="okbadge">✓ 100% local · no account</span>
    <div class="oh-section">Create new</div>
    <div class="oh-grid" id="oh-create">${TYPES.map((t) => card(t.kind, t.label, t.blurb)).join('')}</div>
    <div class="oh-section">Templates</div>
    <div class="oh-grid" id="oh-tpl">${TEMPLATES.map((t) => card(t.kind, t.name, t.desc, 'TEMPLATE')).join('')}</div>
    ${
      recent.length
        ? `<div class="oh-section">Recent</div>
    <div class="oh-recent" id="oh-recent">${recent
      .map(
        (r) =>
          `<button class="oh-rec" data-kind="${r.kind}" data-name="${esc(r.name)}"><span class="oh-rec-ic">${iconOf(r.kind)}</span><span>${esc(r.name)}</span></button>`,
      )
      .join('')}</div>`
        : ''
    }
  </div></div>`
}

function editorHtml(): string {
  const tab = (k: OfficeKind) =>
    `<button class="otab" data-kind="${k}">${iconOf(k)} ${labelOf(k)}</button>`
  return `<div class="office-editor">
    <div class="office-tabs" id="office-tabs">
      <button class="otab oback" id="oback">← Office</button>
      ${TYPES.map((t) => tab(t.kind)).join('')}
    </div>
    <div class="office-build">
      <span class="ob-spark">✨</span>
      <input class="ob-input" id="ob-input" spellcheck="false"
        placeholder="Describe it — Saathi's agents draft it, you edit. e.g. ‘Q3 investor update’" />
      <button class="kp-btn" id="ob-build">Build</button>
    </div>
    <div class="office-body" id="office-body"></div>
  </div>`
}

/** Office: a staged home (Create-new · Templates · Recent) routing into the editors + AI build. */
export function renderOffice(host: HTMLElement): void {
  // A fresh mount (rail click) always opens the launchpad; Recent persists for the session.
  view = 'home'
  active = 'sheets'
  host.innerHTML = `<div class="office" data-pane="office"><div class="office-content" id="office-content"></div></div>`
  const content = host.querySelector<HTMLElement>('#office-content')!

  const open = (kind: OfficeKind, name: string): void => {
    active = kind
    recordRecent(kind, name)
    view = 'editor'
    render()
  }
  const route = (e: Event): void => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-kind]')
    if (b) open(b.dataset.kind as OfficeKind, b.dataset.name || labelOf(b.dataset.kind as OfficeKind))
  }

  function drawEditor(): void {
    const body = content.querySelector<HTMLElement>('#office-body')!
    content
      .querySelectorAll<HTMLElement>('.otab[data-kind]')
      .forEach((t) => t.classList.toggle('on', t.dataset.kind === active))
    loadEditor(active, body)
  }

  function render(): void {
    if (view === 'home') {
      content.innerHTML = homeHtml()
      content.querySelector<HTMLElement>('#oh-create')!.addEventListener('click', route)
      content.querySelector<HTMLElement>('#oh-tpl')!.addEventListener('click', route)
      content.querySelector<HTMLElement>('#oh-recent')?.addEventListener('click', route)
      return
    }
    content.innerHTML = editorHtml()
    content.querySelector<HTMLElement>('#office-tabs')!.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('#oback')) {
        view = 'home'
        render()
        return
      }
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-kind]')
      if (b) {
        active = b.dataset.kind as OfficeKind
        drawEditor()
      }
    })
    content.querySelector<HTMLElement>('#ob-build')!.addEventListener('click', () => {
      const brief = content.querySelector<HTMLInputElement>('#ob-input')!.value.trim()
      if (!brief) return
      const body = content.querySelector<HTMLElement>('#office-body')!
      void aiBuild(active as BuildType, brief, body, makeBuildLlm(), (m) => loadEditor(active, body, m))
    })
    drawEditor()
  }

  render()
}
