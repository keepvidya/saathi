# DEV — 18-memory (M10b)

## 1. Approach
A `MemoryPort` in `@saathi/backend`, implemented by **`JsonMemory`**: items persist to a JSON file (path injected by the host = `app.getPath('userData')/saathi-memory.json`); **recall reuses our domain retrieval** — build a `Corpus` from the memory items and run TF-IDF `retrieve`, mapping hits back to items (deduped, rank order). No native module, no vendor (ADR-0007). `MemoryItem` is a shared DTO. A `memory:*` IPC surface + `bridge.memory` expose it; the **Memory pane** saves notes, searches/recalls, lists recent, and forgets.

## 2. Ports & seams
- `MemoryPort { remember(text): MemoryItem; recall(query, limit?): MemoryItem[]; list(): MemoryItem[]; forget(id): void }`.
- **IPC**: `memory:remember`, `memory:recall`, `memory:list`, `memory:forget`.
- Preload `memory.*`; frontend `MemoryControl` (host or no-op fallback) the pane depends on.

## 3. Domain / shared model
- `MemoryItem { id: string; text: string; createdAt: number }` (`@saathi/shared`).
- Recall ranking = `@saathi/domain` `Corpus` + `retrieve` (no new domain code).

## 4. Data structures & complexity (DSA)
| Operation | Time | Notes |
|---|---|---|
| remember / forget | O(N) write | append/filter + JSON write |
| recall | O(N) | build corpus + TF-IDF over N items |
| list | O(N log N) | sort by createdAt desc |

Fine for personal-scale memory (hundreds–thousands of notes).

## 5. Design patterns
- **Adapter** (`JsonMemory` behind `MemoryPort`), **Repository** (the item store), **Strategy** (recall = domain retrieval; swappable for SQLite-FTS5), **Facade** (`bridge.memory`), **DIP** (pane → `MemoryControl`).

## 6. External modules (Wrapper Rule)
None — `JsonMemory` uses Node `fs` + `@saathi/domain` retrieval. (A future `SqliteMemory` would wrap `better-sqlite3` behind the same port; M11 adds the native-rebuild step.)

## 7. Flow / sequence
Save: pane → `bridge.memory.remember(text)` → `memory:remember` → `JsonMemory.remember` (append + write) → returns the item → pane refreshes. Recall: pane → `memory.recall(query)` → build corpus + `retrieve` → ranked items → render. List/forget similarly.

## 8. Error handling
Unreadable/corrupt file → start empty (no crash). Write failure → swallowed (memory still works in-session). Empty recall query → recent list. Forgetting an unknown id → no-op.

## 9. Risks & mitigations
- **Native-module pain** → avoided (in-house engine; ADR-0007).
- **Corpus rebuilt per recall** → acceptable at personal scale; a persistent index is a later optimisation.
- **Disk write races** → single main-process owner; writes are synchronous.

## 10. ADRs
**ADR-0007** — in-house full-text memory over SQLite-FTS5 (native-module/ABI complexity), with SQLite as a future port swap.
