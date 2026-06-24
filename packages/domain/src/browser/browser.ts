/**
 * Browser core — pure, deterministic. The "our logic" of the browser: deciding
 * whether typed input is a URL or a search, and the tab list/active-tab state
 * machine. No Electron, no DOM — the main process drives WebContentsView from this.
 */

export const DEFAULT_SEARCH = 'https://duckduckgo.com/?q='

export interface AddressResult {
  kind: 'url' | 'search'
  url: string
}

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i
const ABOUT_OR_DATA = /^(about|data|file|view-source):/i
const LOOKS_LIKE_HOST =
  /^(localhost(:\d+)?(\/.*)?|(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/.*)?|[^\s/]+\.[a-z]{2,}(:\d+)?(\/.*)?)$/i

/**
 * Resolve typed input to a concrete URL, classifying URL vs search.
 * - explicit scheme / about: / data: → used as-is
 * - localhost, an IP, or `host.tld` (no spaces) → prefixed with `https://`
 * - anything else → a search query against `searchUrl`
 */
export function parseAddress(input: string, searchUrl: string = DEFAULT_SEARCH): AddressResult {
  const s = input.trim()
  if (s === '') return { kind: 'url', url: 'about:blank' }
  if (HAS_SCHEME.test(s) || ABOUT_OR_DATA.test(s)) return { kind: 'url', url: s }
  if (LOOKS_LIKE_HOST.test(s)) return { kind: 'url', url: `https://${s}` }
  return { kind: 'search', url: `${searchUrl}${encodeURIComponent(s)}` }
}

export interface Tab {
  id: number
  title: string
  url: string
  loading: boolean
  canGoBack: boolean
  canGoForward: boolean
}

export type TabPatch = Partial<Omit<Tab, 'id'>>

/** The tab list + active-tab state machine. Pure; the host mirrors it to real views. */
export class TabSet {
  private readonly tabs: Tab[] = []
  private activeId: number | undefined
  private seq = 0

  open(url = 'about:blank'): number {
    const id = ++this.seq
    this.tabs.push({ id, title: 'New tab', url, loading: false, canGoBack: false, canGoForward: false })
    this.activeId = id
    return id
  }

  close(id: number): void {
    const i = this.tabs.findIndex((t) => t.id === id)
    if (i === -1) return
    this.tabs.splice(i, 1)
    if (this.activeId === id) {
      // activate the right-hand neighbour, else the new last tab, else none
      const next = this.tabs[i] ?? this.tabs[this.tabs.length - 1]
      this.activeId = next?.id
    }
  }

  activate(id: number): void {
    if (this.tabs.some((t) => t.id === id)) this.activeId = id
  }

  update(id: number, patch: TabPatch): void {
    const tab = this.tabs.find((t) => t.id === id)
    if (tab) Object.assign(tab, patch)
  }

  active(): Tab | undefined {
    return this.tabs.find((t) => t.id === this.activeId)
  }

  activeIdOrUndefined(): number | undefined {
    return this.active()?.id
  }

  list(): Tab[] {
    return this.tabs.map((t) => ({ ...t }))
  }

  count(): number {
    return this.tabs.length
  }
}
