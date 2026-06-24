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
  OllamaLlm,
  OllamaChat,
} from '@saathi/backend'
import type { SheetData, DocData, DeckData, NarratePrompt, ChatMessage } from '@saathi/domain'
import { IPC, type AppInfo, type ExportResult, type PyRunResult } from '@saathi/shared'
import { WINDOW_SECURITY, CSP } from './security'

const isDev = !!process.env.ELECTRON_RENDERER_URL

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
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
