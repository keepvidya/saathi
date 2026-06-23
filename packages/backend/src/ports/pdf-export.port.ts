import type { DocData } from '@saathi/domain'

/** Outbound port: render a document to real .pdf bytes. */
export interface PdfExportPort {
  toPdf(doc: DocData): Promise<Uint8Array>
}
