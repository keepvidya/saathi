# BA — 18-memory (M10b · Memory)

## 1. Problem & context
Saathi should **remember** things for you — notes, facts, decisions — and let you **recall** them by searching, locally and privately. M10b adds a persistent, **full-text** memory: write something down, find it later by keyword/relevance. Recall is computed by **our own retrieval engine** (the same TF-IDF that powers Knowledge), not invented. (SQLite-FTS5 is a future swap behind the same port — see ADR-0007.)

## 2. Users & jobs-to-be-done
- Primary: anyone who wants a private scratchpad with search. Job: "When I jot something down, I want to find it later by what it's about — without it leaving my machine."

## 3. User stories
- **US-1**: As a user, I **save** a note to memory.
- **US-2**: As a user, I **recall** notes by searching — the most relevant come first.
- **US-3**: As a user, I see my recent memories and can **forget** one.
- **US-4**: As a user, memory **persists** across restarts, locally.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN text WHEN I remember it THEN it's stored with an id + timestamp. *(→ TC-18.1.1)*
- **AC-2** (US-2): GIVEN saved notes WHEN I recall a query THEN the most relevant notes rank first (TF-IDF). *(→ TC-18.1.2)*
- **AC-3** (US-3): GIVEN memories THEN `list` returns them newest-first; `forget(id)` removes one. *(→ TC-18.1.3)*
- **AC-4** (US-4): memory is written to disk and reloaded on a new instance. *(→ TC-18.1.4)*
- **AC-5** (UI): GIVEN the Memory pane WHEN I save a note and search THEN it appears in the recalled list; forgetting removes it. *(→ TC-18.2.1, TC-18.3.1)*

## 5. Scope
- **In**: a `MemoryPort` (`remember`/`recall`/`list`/`forget`) + a **`JsonMemory`** adapter (`@saathi/backend`, JSON-file persistence, recall via our `Corpus`+`retrieve`); `MemoryItem` (`@saathi/shared`); `memory:*` IPC + `bridge.memory`; a **Memory pane** (save a note, search/recall, recent list, forget).
- **Out** (later): SQLite-FTS5 (ADR-0007), tags/folders, edit-in-place, sync, the agent using memory as a tool (a later wiring), encryption at rest.

## 6. Success metrics / done-signal
Save a few notes, search for one by topic and it ranks first, forget one, restart and they're still there — all local.

## 7. Open questions / decisions for owner
- Engine = in-house TF-IDF + JSON now; SQLite-FTS5 is a drop-in `MemoryPort` swap later (ADR-0007). The agent-as-memory-user wiring is a follow-on.
