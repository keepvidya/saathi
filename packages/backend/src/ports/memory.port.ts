import type { MemoryItem } from '@saathi/shared'

export type { MemoryItem }

/** Outbound port: persistent, full-text-searchable memory (remember / recall). */
export interface MemoryPort {
  remember(text: string): MemoryItem
  recall(query: string, limit?: number): MemoryItem[]
  list(): MemoryItem[]
  forget(id: string): void
}
