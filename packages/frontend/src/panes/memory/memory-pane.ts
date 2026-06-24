import type { MemoryItem } from '@saathi/shared'
import { bridge, type MemoryControl } from '../../bridge/saathi.bridge'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

const when = (ts: number): string =>
  new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export interface MemoryOptions {
  memory?: MemoryControl
}

/**
 * The Memory pane: save private notes and recall them by relevance. Recall is
 * computed by our own full-text engine (the same retrieval as Knowledge) — local
 * and deterministic (ADR-0007).
 */
export function renderMemory(host: HTMLElement, opts: MemoryOptions = {}): void {
  const memory = opts.memory ?? bridge.memoryControl()

  host.innerHTML = `<div class="memory" data-pane="memory">
    <div class="mem-head">
      <h1 class="mem-title">Memory</h1>
      <p class="mem-sub">Save notes and find them later by what they’re about — private, on your machine.</p>
    </div>
    <div class="mem-tools">
      <div class="mem-save">
        <textarea id="mem-text" rows="2" placeholder="Remember something…"></textarea>
        <button class="mem-btn primary" id="mem-save">Save</button>
      </div>
      <input id="mem-q" class="mem-q" placeholder="Search your memory…" spellcheck="false" />
    </div>
    <ul id="mem-list" class="mem-list"></ul>
  </div>`

  const textEl = host.querySelector<HTMLTextAreaElement>('#mem-text')!
  const queryEl = host.querySelector<HTMLInputElement>('#mem-q')!
  const listEl = host.querySelector<HTMLUListElement>('#mem-list')!

  const draw = (items: MemoryItem[], searching: boolean): void => {
    if (items.length === 0) {
      listEl.innerHTML = `<li class="mem-empty">${searching ? 'No memories match that.' : 'Nothing saved yet — write a note above.'}</li>`
      return
    }
    listEl.innerHTML = items
      .map(
        (it) =>
          `<li class="mem-item" data-id="${esc(it.id)}">` +
          `<div class="mem-item-text">${esc(it.text)}</div>` +
          `<div class="mem-item-meta"><span class="mem-when">${esc(when(it.createdAt))}</span>` +
          `<button class="mem-forget" data-forget="${esc(it.id)}" aria-label="Forget">×</button></div></li>`,
      )
      .join('')
  }

  async function refresh(): Promise<void> {
    const q = queryEl.value.trim()
    const items = q ? await memory.recall(q, 20) : await memory.list()
    draw(items, q !== '')
  }

  async function save(): Promise<void> {
    const text = textEl.value.trim()
    if (!text) return
    await memory.remember(text)
    textEl.value = ''
    queryEl.value = ''
    await refresh()
  }

  host.querySelector<HTMLElement>('#mem-save')!.addEventListener('click', () => void save())
  textEl.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter' && (e as KeyboardEvent).ctrlKey) {
      e.preventDefault()
      void save()
    }
  })
  queryEl.addEventListener('input', () => void refresh())
  listEl.addEventListener('click', (e) => {
    const id = (e.target as HTMLElement).closest<HTMLElement>('.mem-forget')?.dataset.forget
    if (id) void memory.forget(id).then(refresh)
  })

  void refresh()
}
