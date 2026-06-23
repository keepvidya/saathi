import { budgetSheet, Sheet, colName, type SheetData } from '@saathi/domain'
import { bridge } from '../../bridge/saathi.bridge'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

/**
 * The Sheets editor (frontend). Uses the pure @saathi/domain Sheet for live recompute —
 * no IPC per keystroke. Frozen header, a formula bar, and a real .xlsx download via the bridge.
 */
export function renderSheets(host: HTMLElement, initial?: SheetData): void {
  const sheet = initial ? Sheet.from(initial) : budgetSheet()
  const COLS = sheet.cols
  const ROWS = sheet.rows
  let active = 'A1'

  host.innerHTML = `
    <div class="sheets">
      <div class="sheets-top">
        <b class="sheets-title">Budget.xlsx</b>
        <span class="sheets-tag">Sheets · local</span>
        <span style="flex:1"></span>
        <button class="kp-btn" id="xlsx-dl">⤓ Download .xlsx</button>
      </div>
      <div class="fbar">
        <span class="fref" id="fref">A1</span>
        <span class="fx">fx</span>
        <input class="fin" id="fin" spellcheck="false" placeholder="Value, or a formula like =SUM(B2:D2)" />
      </div>
      <div class="grid-wrap"><table class="grid" id="grid"></table></div>
      <div class="sheets-status"><span id="status-cell">A1</span><span style="flex:1"></span><span id="status-msg">Ready</span></div>
    </div>`

  const grid = host.querySelector<HTMLTableElement>('#grid')!
  const fin = host.querySelector<HTMLInputElement>('#fin')!
  const fref = host.querySelector<HTMLElement>('#fref')!
  const statusCell = host.querySelector<HTMLElement>('#status-cell')!
  const statusMsg = host.querySelector<HTMLElement>('#status-msg')!

  function buildGrid(): void {
    let h = '<thead><tr><th class="corner"></th>'
    for (let c = 0; c < COLS; c++) h += `<th>${colName(c)}</th>`
    h += '</tr></thead><tbody>'
    for (let r = 1; r <= ROWS; r++) {
      h += `<tr><th class="rownum">${r}</th>`
      for (let c = 0; c < COLS; c++) {
        const ref = colName(c) + r
        h += `<td data-ref="${ref}" contenteditable="true" class="cell${ref === active ? ' sel' : ''}">${esc(sheet.display(ref))}</td>`
      }
      h += '</tr>'
    }
    grid.innerHTML = h + '</tbody>'
  }

  const cell = (ref: string) => grid.querySelector<HTMLElement>(`td[data-ref="${ref}"]`)

  function refreshDisplays(except?: string): void {
    grid.querySelectorAll<HTMLElement>('td[data-ref]').forEach((td) => {
      const ref = td.dataset.ref!
      if (ref !== except) td.textContent = sheet.display(ref)
    })
  }

  function select(ref: string): void {
    active = ref
    grid.querySelectorAll('td.sel').forEach((td) => td.classList.remove('sel'))
    cell(ref)?.classList.add('sel')
    fref.textContent = ref
    fin.value = sheet.getRaw(ref)
    statusCell.textContent = ref
  }

  function commit(ref: string, value: string): void {
    sheet.setRaw(ref, value)
    refreshDisplays()
    statusMsg.textContent = 'Ready'
  }

  buildGrid()
  select('A1')

  grid.addEventListener('focusin', (e) => {
    const td = (e.target as HTMLElement).closest<HTMLElement>('td[data-ref]')
    if (!td) return
    select(td.dataset.ref!)
    td.textContent = sheet.getRaw(td.dataset.ref!) // edit the RAW formula/value
  })
  grid.addEventListener('focusout', (e) => {
    const td = (e.target as HTMLElement).closest<HTMLElement>('td[data-ref]')
    if (!td) return
    commit(td.dataset.ref!, td.textContent ?? '')
  })
  grid.addEventListener('input', (e) => {
    const td = (e.target as HTMLElement).closest<HTMLElement>('td[data-ref]')
    if (td && td.dataset.ref === active) fin.value = td.textContent ?? ''
  })
  grid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      ;(e.target as HTMLElement).blur()
    }
  })

  fin.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      commit(active, fin.value)
      const m = /^([A-Za-z]+)(\d+)$/.exec(active)
      if (m) select(m[1] + Math.min(ROWS, Number(m[2]) + 1))
    }
  })

  host.querySelector<HTMLElement>('#xlsx-dl')!.addEventListener('click', async () => {
    statusMsg.textContent = 'Exporting…'
    const res = await bridge.exportXlsx(sheet.toData())
    statusMsg.textContent = res.saved ? `Saved ${res.path ?? ''}`.trim() : 'Ready'
  })
}
