/**
 * The IPC contract — the ONLY coupling between backend and frontend.
 * One channel name per capability. Pure data/types; no electron/DOM import.
 */
export const IPC = {
  appGetInfo: 'app:getInfo',
  sheetExportXlsx: 'sheet:exportXlsx',
  docExportDocx: 'doc:exportDocx',
  docExportPdf: 'doc:exportPdf',
  slideExportPptx: 'slide:exportPptx',
  llmNarrate: 'llm:narrate',
  chatReply: 'chat:reply',
  pdfExtractText: 'pdf:extractText',
  pyRun: 'py:run',
  browserNewTab: 'browser:newTab',
  browserCloseTab: 'browser:closeTab',
  browserActivate: 'browser:activate',
  browserNavigate: 'browser:navigate',
  browserBack: 'browser:back',
  browserForward: 'browser:forward',
  browserReload: 'browser:reload',
  browserSetBounds: 'browser:setBounds',
  browserSetVisible: 'browser:setVisible',
  browserToggleShields: 'browser:toggleShields',
  /** push: main → renderer, on any tab/navigation/shields change */
  browserEvent: 'browser:event',
  memoryRemember: 'memory:remember',
  memoryRecall: 'memory:recall',
  memoryList: 'memory:list',
  memoryForget: 'memory:forget',
  settingsGet: 'settings:get',
  settingsSet: 'settings:set',
  secretSet: 'secret:set',
  secretHas: 'secret:has',
  secretClear: 'secret:clear',
} as const

export type IpcChannel = (typeof IPC)[keyof typeof IPC]

export interface AppInfo {
  name: string
  version: string
  platform: string
}

/** Result of a save-to-disk export. */
export interface ExportResult {
  saved: boolean
  path?: string
}

/** Result of running a code snippet: success flag + combined stdout/stderr (or error). */
export interface PyRunResult {
  ok: boolean
  output: string
}

/** A browser tab's state, as carried over IPC (mirrors the domain `Tab`). */
export interface TabState {
  id: number
  title: string
  url: string
  loading: boolean
  canGoBack: boolean
  canGoForward: boolean
}

/** Ad/tracker-blocking state: on/off + how many requests blocked this session. */
export interface ShieldsState {
  enabled: boolean
  blocked: number
}

/** A saved memory note. */
export interface MemoryItem {
  id: string
  text: string
  createdAt: number
}

/** Non-secret app configuration (API keys are stored separately + encrypted). */
export interface AppSettings {
  userName: string
  llmMode: 'offline' | 'cloud'
  cloudProvider: string
  searchProvider: 'none' | 'serper' | 'brave'
  onboarded: boolean
}

/** Names of the secrets held (encrypted) by the main-process SecretStore. */
export const SECRET_LLM = 'llm-api-key'
export const SECRET_SEARCH = 'search-api-key'

/** Default (first-run) settings. */
export function defaultSettings(): AppSettings {
  return {
    userName: '',
    llmMode: 'offline',
    cloudProvider: 'openai',
    searchProvider: 'none',
    onboarded: false,
  }
}

/** The whole browser state pushed to the renderer on any change. */
export interface BrowserSnapshot {
  tabs: TabState[]
  activeId?: number
  shields: ShieldsState
}

/** Pixel bounds of the renderer's content region, where the active view is sized. */
export interface ViewBounds {
  x: number
  y: number
  width: number
  height: number
}
