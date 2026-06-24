import type {
  AppInfo,
  ExportResult,
  PyRunResult,
  BrowserSnapshot,
  ViewBounds,
  MemoryItem,
  AppSettings,
} from '@saathi/shared'
import { defaultSettings } from '@saathi/shared'
import type { SheetData, DocData, DeckData, NarratePrompt, ChatMessage } from '@saathi/domain'

/** The memory surface the Memory pane depends on (host or a test stub). */
export interface MemoryControl {
  remember(text: string): Promise<MemoryItem | null>
  recall(query: string, limit?: number): Promise<MemoryItem[]>
  list(): Promise<MemoryItem[]>
  forget(id: string): Promise<void>
}

/** Settings + secrets surface for the Settings/Onboarding panes. Keys can be set/checked/cleared, never read. */
export interface SettingsControl {
  get(): Promise<AppSettings>
  set(patch: Partial<AppSettings>): Promise<AppSettings>
  hasSecret(name: string): Promise<boolean>
  setSecret(name: string, value: string): Promise<void>
  clearSecret(name: string): Promise<void>
}

/** The browser control surface the Browser pane depends on (host or a test stub). */
export interface BrowserPort {
  newTab(url?: string): Promise<BrowserSnapshot>
  closeTab(id: number): Promise<void>
  activate(id: number): Promise<void>
  navigate(id: number, input: string): Promise<void>
  back(id: number): Promise<void>
  forward(id: number): Promise<void>
  reload(id: number): Promise<void>
  setBounds(rect: ViewBounds): Promise<void>
  setVisible(visible: boolean): Promise<void>
  toggleShields(): Promise<void>
  onEvent(cb: (snap: BrowserSnapshot) => void): () => void
}

type SaathiWindow = {
  saathi?: {
    app: { getInfo(): Promise<AppInfo> }
    sheet?: { exportXlsx(data: SheetData): Promise<ExportResult> }
    doc?: { exportDocx(data: DocData): Promise<ExportResult>; exportPdf(data: DocData): Promise<ExportResult> }
    slide?: { exportPptx(data: DeckData): Promise<ExportResult> }
    llm?: { narrate(p: NarratePrompt): Promise<string[]> }
    chat?: { reply(messages: ChatMessage[]): Promise<string> }
    pdf?: { extractText(bytes: Uint8Array): Promise<string> }
    py?: { run(code: string): Promise<PyRunResult> }
    browser?: BrowserPort
    memory?: MemoryControl
    settings?: { get(): Promise<AppSettings>; set(p: Partial<AppSettings>): Promise<AppSettings> }
    secrets?: {
      set(name: string, value: string): Promise<void>
      has(name: string): Promise<boolean>
      clear(name: string): Promise<void>
    }
  }
}

/**
 * Facade over window.saathi — the ONLY place the frontend touches the platform.
 * Falls back gracefully when no preload is present (standalone browser / unit tests).
 * The frontend never imports the backend or Electron — only this bridge + shared/domain types.
 */
async function getAppInfo(): Promise<AppInfo> {
  const w = globalThis as unknown as SaathiWindow
  if (w.saathi?.app?.getInfo) return w.saathi.app.getInfo()
  return { name: 'Saathi', version: '0.0.0-dev', platform: 'web' }
}

async function exportXlsx(data: SheetData): Promise<ExportResult> {
  const w = globalThis as unknown as SaathiWindow
  if (w.saathi?.sheet?.exportXlsx) return w.saathi.sheet.exportXlsx(data)
  return { saved: false } // no host (standalone/tests) — nothing to write
}

async function exportDocx(data: DocData): Promise<ExportResult> {
  const w = globalThis as unknown as SaathiWindow
  if (w.saathi?.doc?.exportDocx) return w.saathi.doc.exportDocx(data)
  return { saved: false }
}

async function exportPptx(data: DeckData): Promise<ExportResult> {
  const w = globalThis as unknown as SaathiWindow
  if (w.saathi?.slide?.exportPptx) return w.saathi.slide.exportPptx(data)
  return { saved: false }
}

async function exportPdf(data: DocData): Promise<ExportResult> {
  const w = globalThis as unknown as SaathiWindow
  if (w.saathi?.doc?.exportPdf) return w.saathi.doc.exportPdf(data)
  return { saved: false }
}

/** Narrate via the host (Ollama). Returns [] when unavailable → caller falls back. */
async function narrate(p: NarratePrompt): Promise<string[]> {
  const w = globalThis as unknown as SaathiWindow
  if (w.saathi?.llm?.narrate) return w.saathi.llm.narrate(p)
  return []
}

/** Chat via the host (Ollama). Returns '' when unavailable → caller falls back. */
async function chatReply(messages: ChatMessage[]): Promise<string> {
  const w = globalThis as unknown as SaathiWindow
  if (w.saathi?.chat?.reply) return w.saathi.chat.reply(messages)
  return ''
}

/** Extract text from PDF bytes via the host (pdf.js). Returns '' when unavailable. */
async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const w = globalThis as unknown as SaathiWindow
  if (w.saathi?.pdf?.extractText) return w.saathi.pdf.extractText(bytes)
  return ''
}

/** Run Python via the host (Pyodide in main). Without a host, says it needs the app. */
async function runPython(code: string): Promise<PyRunResult> {
  const w = globalThis as unknown as SaathiWindow
  if (w.saathi?.py?.run) return w.saathi.py.run(code)
  return { ok: false, output: 'Running code needs the Saathi desktop app.' }
}

/** The browser control surface. Uses the host when present, else a safe no-op port. */
function browserPort(): BrowserPort {
  const w = globalThis as unknown as SaathiWindow
  if (w.saathi?.browser) return w.saathi.browser
  const empty: BrowserSnapshot = { tabs: [], activeId: undefined, shields: { enabled: true, blocked: 0 } }
  return {
    newTab: async () => empty,
    closeTab: async () => {},
    activate: async () => {},
    navigate: async () => {},
    back: async () => {},
    forward: async () => {},
    reload: async () => {},
    setBounds: async () => {},
    setVisible: async () => {},
    toggleShields: async () => {},
    onEvent: () => () => {},
  }
}

/** The memory surface. Uses the host when present, else a safe in-tab fallback. */
function memoryControl(): MemoryControl {
  const w = globalThis as unknown as SaathiWindow
  if (w.saathi?.memory) return w.saathi.memory
  return {
    remember: async () => null,
    recall: async () => [],
    list: async () => [],
    forget: async () => {},
  }
}

/** Settings + secrets. Uses the host when present, else an in-tab default (no persistence). */
function settingsControl(): SettingsControl {
  const w = globalThis as unknown as SaathiWindow
  const s = w.saathi
  if (s?.settings && s?.secrets) {
    return {
      get: () => s.settings!.get(),
      set: (patch) => s.settings!.set(patch),
      hasSecret: (name) => s.secrets!.has(name),
      setSecret: (name, value) => s.secrets!.set(name, value),
      clearSecret: (name) => s.secrets!.clear(name),
    }
  }
  let local = defaultSettings()
  return {
    get: async () => local,
    set: async (patch) => (local = { ...local, ...patch }),
    hasSecret: async () => false,
    setSecret: async () => {},
    clearSecret: async () => {},
  }
}

export const bridge = {
  getAppInfo,
  exportXlsx,
  exportDocx,
  exportPdf,
  exportPptx,
  narrate,
  chatReply,
  extractPdfText,
  runPython,
  browserPort,
  memoryControl,
  settingsControl,
}
