import type { AppInfo, ExportResult } from '@saathi/shared'
import type { SheetData, DocData, DeckData, NarratePrompt, ChatMessage } from '@saathi/domain'

type SaathiWindow = {
  saathi?: {
    app: { getInfo(): Promise<AppInfo> }
    sheet?: { exportXlsx(data: SheetData): Promise<ExportResult> }
    doc?: { exportDocx(data: DocData): Promise<ExportResult>; exportPdf(data: DocData): Promise<ExportResult> }
    slide?: { exportPptx(data: DeckData): Promise<ExportResult> }
    llm?: { narrate(p: NarratePrompt): Promise<string[]> }
    chat?: { reply(messages: ChatMessage[]): Promise<string> }
    pdf?: { extractText(bytes: Uint8Array): Promise<string> }
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

export const bridge = {
  getAppInfo,
  exportXlsx,
  exportDocx,
  exportPdf,
  exportPptx,
  narrate,
  chatReply,
  extractPdfText,
}
