import { IPC, type AppInfo, type ExportResult } from '@saathi/shared'
import type { SheetData, DocData, DeckData, NarratePrompt, ChatMessage } from '@saathi/domain'

/** Pure API factory — testable without Electron. One method per IPC channel. */
export type Invoke = (channel: string, ...args: unknown[]) => Promise<unknown>

export function buildApi(invoke: Invoke) {
  return {
    app: {
      getInfo: (): Promise<AppInfo> => invoke(IPC.appGetInfo) as Promise<AppInfo>,
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
  }
}

export type SaathiApi = ReturnType<typeof buildApi>
