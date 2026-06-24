// In-house full-text memory (ADR-0007): JSON-file persistence + ranked recall via
// our OWN domain retrieval (the same TF-IDF as Knowledge). No native module, no vendor.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { Corpus, retrieve } from '@saathi/domain'
import type { MemoryItem, MemoryPort } from '../../ports/memory.port'

export class JsonMemory implements MemoryPort {
  private items: MemoryItem[]
  private lastTs = 0

  constructor(private readonly file: string) {
    this.items = this.load()
    this.lastTs = this.items.reduce((m, i) => Math.max(m, i.createdAt), 0)
  }

  private load(): MemoryItem[] {
    try {
      if (!existsSync(this.file)) return []
      const data = JSON.parse(readFileSync(this.file, 'utf8'))
      return Array.isArray(data) ? (data as MemoryItem[]) : []
    } catch {
      return [] // corrupt/unreadable → start fresh, never crash
    }
  }

  private save(): void {
    try {
      writeFileSync(this.file, JSON.stringify(this.items, null, 2))
    } catch {
      /* in-session memory still works even if the write fails */
    }
  }

  remember(text: string): MemoryItem {
    // strictly monotonic so list() ordering is unambiguous even within a millisecond
    const createdAt = Math.max(Date.now(), this.lastTs + 1)
    this.lastTs = createdAt
    const item: MemoryItem = {
      id: `m-${createdAt.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      text: text.trim(),
      createdAt,
    }
    this.items.push(item)
    this.save()
    return item
  }

  recall(query: string, limit = 10): MemoryItem[] {
    if (query.trim() === '') return this.list().slice(0, limit)
    const corpus = new Corpus()
    for (const it of this.items) corpus.add({ id: it.id, title: it.text.slice(0, 40), text: it.text })

    const seen = new Set<string>()
    const out: MemoryItem[] = []
    for (const hit of retrieve(corpus, query, limit * 2)) {
      const id = hit.chunk.docId
      if (seen.has(id)) continue
      seen.add(id)
      const item = this.items.find((i) => i.id === id)
      if (item) out.push(item)
      if (out.length >= limit) break
    }
    return out
  }

  list(): MemoryItem[] {
    return [...this.items].sort((a, b) => b.createdAt - a.createdAt)
  }

  forget(id: string): void {
    const before = this.items.length
    this.items = this.items.filter((i) => i.id !== id)
    if (this.items.length !== before) this.save()
  }
}
