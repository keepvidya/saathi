import type { DocData } from '@saathi/domain'

/** Outbound port: turn a document into real .docx bytes. */
export interface DocExportPort {
  toDocx(doc: DocData): Promise<Uint8Array>
}
