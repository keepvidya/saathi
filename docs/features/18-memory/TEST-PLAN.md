# TEST PLAN — 18-memory (M10b)

- **Plan id**: TP-18
- **Items under test**: `@saathi/backend` `JsonMemory` (`MemoryPort`), `memory:*` IPC + `bridge.memory`, the Memory pane.
- **Approach**: unit (backend) + integration (pane) + e2e.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-18.1 — JsonMemory (UNIT · backend, temp file)

### TC-18.1.1 — remember
| # | Action | Expected |
|---|---|---|
| 1 | `remember('buy milk')` | returns an item with a non-empty id, the text, a `createdAt` |

### TC-18.1.2 — recall ranks by relevance
| # | Action | Expected |
|---|---|---|
| 1 | remember notes about "taxes" and "photosynthesis"; `recall('how plants make energy')` | the photosynthesis note ranks first |
| 2 | `recall(q, 1)` | at most 1 result |

### TC-18.1.3 — list + forget
| # | Action | Expected |
|---|---|---|
| 1 | remember A then B; `list()` | B first (newest), then A |
| 2 | `forget(A.id)`; `list()` | only B remains |

### TC-18.1.4 — persistence
| # | Action | Expected |
|---|---|---|
| 1 | remember on one instance; create a new `JsonMemory` on the same file | the note is loaded |
| 2 | a corrupt file | a new instance starts empty (no throw) |

---
## Suite TS-18.2 — Memory pane (INTEGRATION · injected port)

### TC-18.2.1 — save → list → recall → forget
| # | Action | Expected |
|---|---|---|
| 1 | render Memory (stub port); type a note; Save | port `remember` called; the note shows in the list |
| 2 | type a recall query; search | port `recall` called; matches render |
| 3 | click a note's ✕ | port `forget` called with its id |

---
## Suite TS-18.3 — Flow (E2E · Playwright-Electron)

### TC-18.3.1 — Memory: save → recall
| # | Action | Expected |
|---|---|---|
| 1 | launch → Memory; save "Project Saathi ships M10"; search "saathi" | the note appears (light + dark screenshots) |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-18.1.1, TC-18.2.1, TC-18.3.1 |
| AC-2 | TC-18.1.2, TC-18.2.1, TC-18.3.1 |
| AC-3 | TC-18.1.3, TC-18.2.1 |
| AC-4 | TC-18.1.4 |
| AC-5 | TC-18.2.1, TC-18.3.1 |
