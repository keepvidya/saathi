import {
  IPC,
  type AppInfo,
  type ExportResult,
  type PyRunResult,
  type BrowserSnapshot,
  type ViewBounds,
  type MemoryItem,
  type AppSettings,
  type HardwareInfo,
  type OllamaStatus,
  type SetupProgress,
} from '@saathi/shared'
import type { SheetData, DocData, DeckData, NarratePrompt, ChatMessage } from '@saathi/domain'

/** Pure API factory — testable without Electron. One method per IPC channel. */
export type Invoke = (channel: string, ...args: unknown[]) => Promise<unknown>
/** Subscribe to a push channel; returns an unsubscribe. No-op by default (tests). */
export type On = (channel: string, listener: (...args: unknown[]) => void) => () => void

export function buildApi(invoke: Invoke, on: On = () => () => {}) {
  return {
    app: {
      getInfo: (): Promise<AppInfo> => invoke(IPC.appGetInfo) as Promise<AppInfo>,
      firstRun: (): Promise<boolean> => invoke(IPC.appFirstRun) as Promise<boolean>,
    },
    sheet: {
      exportXlsx: (data: SheetData): Promise<ExportResult> =>
        invoke(IPC.sheetExportXlsx, data) as Promise<ExportResult>,
    },
    doc: {
      exportDocx: (data: DocData): Promise<ExportResult> =>
        invoke(IPC.docExportDocx, data) as Promise<ExportResult>,
      exportPdf: (data: DocData): Promise<ExportResult> =>
        invoke(IPC.docExportPdf, data) as Promise<ExportResult>,
    },
    slide: {
      exportPptx: (data: DeckData): Promise<ExportResult> =>
        invoke(IPC.slideExportPptx, data) as Promise<ExportResult>,
    },
    llm: {
      narrate: (p: NarratePrompt): Promise<string[]> => invoke(IPC.llmNarrate, p) as Promise<string[]>,
    },
    chat: {
      reply: (messages: ChatMessage[]): Promise<string> =>
        invoke(IPC.chatReply, messages) as Promise<string>,
    },
    pdf: {
      extractText: (bytes: Uint8Array): Promise<string> =>
        invoke(IPC.pdfExtractText, bytes) as Promise<string>,
    },
    py: {
      run: (code: string): Promise<PyRunResult> => invoke(IPC.pyRun, code) as Promise<PyRunResult>,
    },
    browser: {
      newTab: (url?: string): Promise<BrowserSnapshot> =>
        invoke(IPC.browserNewTab, url) as Promise<BrowserSnapshot>,
      closeTab: (id: number): Promise<void> => invoke(IPC.browserCloseTab, id) as Promise<void>,
      activate: (id: number): Promise<void> => invoke(IPC.browserActivate, id) as Promise<void>,
      navigate: (id: number, input: string): Promise<void> =>
        invoke(IPC.browserNavigate, id, input) as Promise<void>,
      back: (id: number): Promise<void> => invoke(IPC.browserBack, id) as Promise<void>,
      forward: (id: number): Promise<void> => invoke(IPC.browserForward, id) as Promise<void>,
      reload: (id: number): Promise<void> => invoke(IPC.browserReload, id) as Promise<void>,
      setBounds: (rect: ViewBounds): Promise<void> =>
        invoke(IPC.browserSetBounds, rect) as Promise<void>,
      setVisible: (visible: boolean): Promise<void> =>
        invoke(IPC.browserSetVisible, visible) as Promise<void>,
      toggleShields: (): Promise<void> => invoke(IPC.browserToggleShields) as Promise<void>,
      onEvent: (cb: (snap: BrowserSnapshot) => void): (() => void) =>
        on(IPC.browserEvent, (snap) => cb(snap as BrowserSnapshot)),
    },
    memory: {
      remember: (text: string): Promise<MemoryItem | null> =>
        invoke(IPC.memoryRemember, text) as Promise<MemoryItem | null>,
      recall: (query: string, limit?: number): Promise<MemoryItem[]> =>
        invoke(IPC.memoryRecall, query, limit) as Promise<MemoryItem[]>,
      list: (): Promise<MemoryItem[]> => invoke(IPC.memoryList) as Promise<MemoryItem[]>,
      forget: (id: string): Promise<void> => invoke(IPC.memoryForget, id) as Promise<void>,
    },
    settings: {
      get: (): Promise<AppSettings> => invoke(IPC.settingsGet) as Promise<AppSettings>,
      set: (patch: Partial<AppSettings>): Promise<AppSettings> =>
        invoke(IPC.settingsSet, patch) as Promise<AppSettings>,
    },
    secrets: {
      // set / has / clear only — there is no `get` (plaintext keys never leave main).
      set: (name: string, value: string): Promise<void> =>
        invoke(IPC.secretSet, name, value) as Promise<void>,
      has: (name: string): Promise<boolean> => invoke(IPC.secretHas, name) as Promise<boolean>,
      clear: (name: string): Promise<void> => invoke(IPC.secretClear, name) as Promise<void>,
    },
    system: {
      hardware: (): Promise<HardwareInfo> => invoke(IPC.systemHardware) as Promise<HardwareInfo>,
    },
    ollama: {
      status: (): Promise<OllamaStatus> => invoke(IPC.ollamaStatus) as Promise<OllamaStatus>,
      setup: (model: string): Promise<void> => invoke(IPC.ollamaSetup, model) as Promise<void>,
      onProgress: (cb: (p: SetupProgress) => void): (() => void) =>
        on(IPC.ollamaSetupProgress, (p) => cb(p as SetupProgress)),
    },
  }
}

export type SaathiApi = ReturnType<typeof buildApi>
