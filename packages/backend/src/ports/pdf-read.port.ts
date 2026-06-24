/** Outbound port: extract plain text from PDF bytes (for knowledge ingest). */
export interface PdfReadPort {
  extractText(bytes: Uint8Array): Promise<string>
}
