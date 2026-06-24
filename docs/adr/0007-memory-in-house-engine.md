# ADR-0007 — In-house full-text memory (over SQLite-FTS5, for now)

- **Status**: Accepted
- **Date**: 2026-06-24
- **Relates to**: the BUILD-PLAN M10 ("Hermes-style memory, SQLite-FTS5"), ADR-0004 (domain), the Wrapper Rule

## Context
M10b adds **persistent, full-text-searchable memory** (remember / recall). The plan named **SQLite-FTS5** (`better-sqlite3`). But `better-sqlite3` is a **native addon**: it builds against a specific Node ABI, and Electron ships a *different* ABI — so it needs `@electron/rebuild` (an extra build step + CI complexity + a real flakiness risk), and the same binary **can't** be loaded by both the Electron main process *and* the Node (vitest) test runner — so the adapter couldn't be unit-tested in Node. A WASM SQLite with FTS5 needs a custom build. None of this is worth it for the walking skeleton.

## Decision
Implement memory with an **in-house full-text engine**: a `MemoryPort` (`remember`, `recall`, `list`, `forget`) implemented by **`JsonMemory`** in `@saathi/backend` — plain-Node, persisting items to a JSON file, and **reusing our own `@saathi/domain` retrieval (`Corpus` + TF-IDF `retrieve`)** for ranked recall. No native module, no vendor.

Why this is a good fit:
- **Narrator/DNA** — recall is computed by *our* engine, not delegated to a black-box DB; the same TF-IDF that powers Knowledge powers Memory.
- **Testable** — `JsonMemory` is pure Node (fs + domain), unit-tested in vitest against a temp file; it's covered like any other backend adapter.
- **CI-safe + simple** — no `@electron/rebuild`, no ABI juggling, no extra CI step.

## Consequences / follow-ups
- For very large memory stores, a JSON file + rebuild-corpus-per-recall is O(N); fine for personal-scale memory (hundreds–thousands of notes).
- **SQLite-FTS5 (`better-sqlite3`) remains a clean future swap** behind the same `MemoryPort` — when packaging adds the native-rebuild step (M11), an `SqliteMemory` adapter can replace `JsonMemory` with no change to the IPC, the pane, or the contract.
