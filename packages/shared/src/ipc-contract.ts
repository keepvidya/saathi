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
