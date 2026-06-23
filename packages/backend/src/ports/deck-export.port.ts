import type { DeckData } from '@saathi/domain'

/** Outbound port: turn a deck into real .pptx bytes. */
export interface DeckExportPort {
  toPptx(deck: DeckData): Promise<Uint8Array>
}
