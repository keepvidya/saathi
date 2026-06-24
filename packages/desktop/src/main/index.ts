import { app, BrowserWindow, ipcMain, session, shell, dialog } from 'electron'
import { join } from 'path'
import { writeFile } from 'fs/promises'
import {
  buildAppInfo,
  ExcelJsSpreadsheetExport,
  DocxDocExport,
  PptxDeckExport,
  PdfLibDocExport,
  PdfJsRead,
  PyodideRun,
  JsonMemory,
  JsonSettings,
  OllamaLlm,
  OllamaChat,
} from '@saathi/backend'
import type { SheetData, DocData, DeckData, NarratePrompt, ChatMessage } from '@saathi/domain'
import {
  IPC,
  type AppInfo,
  type ExportResult,
  type PyRunResult,
  type ViewBounds,
  type AppSettings,
} from '@saathi/shared'
import updaterPkg from 'electron-updater'
import { WINDOW_SECURITY, CSP } from './security'
import { BrowserTabs } from './browser-tabs'
import { SecretStore } from './secret-store'
import { hardwareInfo, ollamaStatus, OllamaSetup } from './system-setup'

const { autoUpdater } = updaterPkg

const isDev = !!process.env.ELECTRON_RENDERER_URL

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 940,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#FBF8F3',
    title: 'Saathi',
    webPreferences: {
      ...WINDOW_SECURITY,
      preload: join(__dirname, '../preload/index.js'),
    },
  })
  mainWindow = win

  win.on('ready-to-show', () => win.show())

  // External links open in the OS browser, never in-app (security baseline).
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) void shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL as string)
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Composition root: the host wires the backend's pure service to the IPC channel.
ipcMain.handle(IPC.appGetInfo, (): AppInfo =>
  buildAppInfo({ version: app.getVersion(), platform: process.platform }),
)

const spreadsheetExport = new ExcelJsSpreadsheetExport()
const docExport = new DocxDocExport()
const deckExport = new PptxDeckExport()
const pdfExport = new PdfLibDocExport()

async function saveExport(
  defaultPath: string,
  ext: string,
  filterName: string,
  bytes: Promise<Uint8Array>,
): Promise<ExportResult> {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath,
      filters: [{ name: filterName, extensions: [ext] }],
    })
    if (canceled || !filePath) return { saved: false }
    await writeFile(filePath, Buffer.from(await bytes))
    return { saved: true, path: filePath }
  } catch {
    return { saved: false }
  }
}

// Export a sheet to a real .xlsx via a Save dialog (the host owns the filesystem).
ipcMain.handle(IPC.sheetExportXlsx, async (_e, data: SheetData): Promise<ExportResult> => {
  if (!data || typeof data !== 'object' || typeof data.cells !== 'object') return { saved: false }
  return saveExport('Budget.xlsx', 'xlsx', 'Excel Workbook', spreadsheetExport.toXlsx(data))
})

// Export a document to a real .docx.
ipcMain.handle(IPC.docExportDocx, async (_e, data: DocData): Promise<ExportResult> => {
  if (!data || typeof data !== 'object' || !Array.isArray(data.blocks)) return { saved: false }
  return saveExport('Proposal.docx', 'docx', 'Word Document', docExport.toDocx(data))
})

// Export a document to a real .pdf.
ipcMain.handle(IPC.docExportPdf, async (_e, data: DocData): Promise<ExportResult> => {
  if (!data || typeof data !== 'object' || !Array.isArray(data.blocks)) return { saved: false }
  return saveExport('Document.pdf', 'pdf', 'PDF Document', pdfExport.toPdf(data))
})

// Export a deck to a real .pptx.
ipcMain.handle(IPC.slideExportPptx, async (_e, data: DeckData): Promise<ExportResult> => {
  if (!data || typeof data !== 'object' || !Array.isArray(data.slides)) return { saved: false }
  return saveExport('Deck.pptx', 'pptx', 'PowerPoint Presentation', deckExport.toPptx(data))
})

// Narrate prose via local Ollama (returns [] if unavailable → renderer falls back to TemplateLlm).
const ollama = new OllamaLlm()
ipcMain.handle(IPC.llmNarrate, async (_e, p: NarratePrompt): Promise<string[]> => {
  if (!p || typeof p.task !== 'string') return []
  return ollama.narrate(p)
})

// Chat via local Ollama (returns '' if unavailable → renderer falls back to EchoChat).
const ollamaChat = new OllamaChat()
ipcMain.handle(IPC.chatReply, async (_e, messages: ChatMessage[]): Promise<string> => {
  if (!Array.isArray(messages)) return ''
  return ollamaChat.reply(messages)
})

// Extract text from PDF bytes for knowledge ingest (returns '' on bad input or failure).
const pdfRead = new PdfJsRead()
ipcMain.handle(IPC.pdfExtractText, async (_e, bytes: unknown): Promise<string> => {
  if (!(bytes instanceof Uint8Array) && !Array.isArray(bytes)) return ''
  return pdfRead.extractText(bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes as number[]))
})

// Run a Python snippet locally (Pyodide in main — ADR-0006). Lazy-loads on first run.
const pyRun = new PyodideRun()
ipcMain.handle(IPC.pyRun, async (_e, code: unknown): Promise<PyRunResult> => {
  if (typeof code !== 'string') return { ok: false, output: 'Invalid code.' }
  return pyRun.run(code)
})

// Multi-tab web browser (WebContentsView host, M9a). Lazily created with the window.
let browser: BrowserTabs | null = null
function browserTabs(): BrowserTabs | null {
  if (!mainWindow) return null
  if (!browser) {
    const win = mainWindow
    browser = new BrowserTabs(win, (snap) => win.webContents.send(IPC.browserEvent, snap))
  }
  return browser
}
const asId = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

ipcMain.handle(IPC.browserNewTab, (_e, url: unknown) =>
  browserTabs()?.newTab(typeof url === 'string' ? url : undefined),
)
ipcMain.handle(IPC.browserCloseTab, (_e, id: unknown) => {
  const n = asId(id)
  if (n !== null) browserTabs()?.close(n)
})
ipcMain.handle(IPC.browserActivate, (_e, id: unknown) => {
  const n = asId(id)
  if (n !== null) browserTabs()?.activate(n)
})
ipcMain.handle(IPC.browserNavigate, (_e, id: unknown, input: unknown) => {
  const n = asId(id)
  if (n !== null && typeof input === 'string') browserTabs()?.navigate(n, input)
})
ipcMain.handle(IPC.browserBack, (_e, id: unknown) => {
  const n = asId(id)
  if (n !== null) browserTabs()?.back(n)
})
ipcMain.handle(IPC.browserForward, (_e, id: unknown) => {
  const n = asId(id)
  if (n !== null) browserTabs()?.forward(n)
})
ipcMain.handle(IPC.browserReload, (_e, id: unknown) => {
  const n = asId(id)
  if (n !== null) browserTabs()?.reload(n)
})
ipcMain.handle(IPC.browserSetBounds, (_e, rect: unknown) => {
  const r = rect as ViewBounds
  if (r && typeof r.x === 'number' && typeof r.width === 'number') browserTabs()?.setBounds(r)
})
ipcMain.handle(IPC.browserSetVisible, (_e, v: unknown) => browserTabs()?.setVisible(!!v))
ipcMain.handle(IPC.browserToggleShields, () => browserTabs()?.toggleShields())

// Persistent local memory (in-house full-text engine, ADR-0007). Lazy file in userData.
let memory: JsonMemory | null = null
function mem(): JsonMemory {
  if (!memory) memory = new JsonMemory(join(app.getPath('userData'), 'saathi-memory.json'))
  return memory
}
ipcMain.handle(IPC.memoryRemember, (_e, text: unknown) =>
  typeof text === 'string' && text.trim() ? mem().remember(text) : null,
)
ipcMain.handle(IPC.memoryRecall, (_e, query: unknown, limit: unknown) =>
  mem().recall(typeof query === 'string' ? query : '', typeof limit === 'number' ? limit : undefined),
)
ipcMain.handle(IPC.memoryList, () => mem().list())
ipcMain.handle(IPC.memoryForget, (_e, id: unknown) => {
  if (typeof id === 'string') mem().forget(id)
})

// Settings (non-secret JSON) + secrets (encrypted via safeStorage — ADR-0008). Lazy.
let settings: JsonSettings | null = null
let secrets: SecretStore | null = null
function settingsStore(): JsonSettings {
  if (!settings) settings = new JsonSettings(join(app.getPath('userData'), 'saathi-settings.json'))
  return settings
}
function secretStore(): SecretStore {
  if (!secrets) secrets = new SecretStore(join(app.getPath('userData'), 'saathi-secrets.json'))
  return secrets
}
// First-run onboarding: only in a packaged build (so dev/e2e get the shell),
// unless explicitly forced for testing the wizard.
ipcMain.handle(
  IPC.appFirstRun,
  (): boolean =>
    (app.isPackaged && !settingsStore().get().onboarded) ||
    process.argv.includes('--force-onboarding'),
)
ipcMain.handle(IPC.settingsGet, () => settingsStore().get())
ipcMain.handle(IPC.settingsSet, (_e, patch: unknown) =>
  settingsStore().set((patch ?? {}) as Partial<AppSettings>),
)
ipcMain.handle(IPC.secretSet, (_e, name: unknown, value: unknown) => {
  if (typeof name === 'string' && typeof value === 'string') secretStore().setSecret(name, value)
})
ipcMain.handle(IPC.secretHas, (_e, name: unknown) =>
  typeof name === 'string' ? secretStore().hasSecret(name) : false,
)
ipcMain.handle(IPC.secretClear, (_e, name: unknown) => {
  if (typeof name === 'string') secretStore().clearSecret(name)
})
// NOTE: there is deliberately NO secret:get handler — plaintext keys stay in main.

// Hardware check + Ollama/Shiva setup (onboarding). The installer bundles neither;
// for offline modes we pull the Shiva model, installing Ollama first if missing.
ipcMain.handle(IPC.systemHardware, () => hardwareInfo())
ipcMain.handle(IPC.ollamaStatus, () => ollamaStatus())
ipcMain.handle(IPC.ollamaSetup, async (_e, model: unknown): Promise<void> => {
  if (typeof model !== 'string' || !model) return
  const setup = new OllamaSetup((p) => mainWindow?.webContents.send(IPC.ollamaSetupProgress, p))
  await setup.run(model)
})

void app.whenReady().then(() => {
  if (!isDev) {
    session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
      cb({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [CSP] } })
    })
  }
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  // Auto-update (packaged builds only; the release feed is published by CI in M12).
  if (app.isPackaged) {
    autoUpdater.autoDownload = true
    void autoUpdater.checkForUpdatesAndNotify().catch(() => {})
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
