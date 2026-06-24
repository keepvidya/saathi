# QA — 18-memory (M10b)

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Recall misses / wrong order | M | M | TF-IDF recall unit |
| Data lost on restart | L | **H** | persistence round-trip unit |
| Corrupt file crashes app | L | **H** | load-empty-on-error unit |
| Forget removes wrong item | L | M | forget unit |
| Memory leaves the machine | L | **H** (DNA) | local JSON only; no network |

## 2. Test approach by level
- **Unit (backend)**: `JsonMemory` against a temp file — `remember` assigns id+timestamp; `recall` ranks the relevant note first and respects the limit; `list` is newest-first; `forget` removes; a new instance reloads from disk; a corrupt file → empty (no throw).
- **Integration (frontend)**: the Memory pane — saving a note adds it to the list (injected port); recall shows the matching note; forget removes it.
- **E2E**: open Memory → save a note → search it → it appears → forget it.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 remember | TC-18.1.1 | TC-18.2.1 | TC-18.3.1 |
| AC-2 recall | TC-18.1.2 | TC-18.2.1 | TC-18.3.1 |
| AC-3 list/forget | TC-18.1.3 | TC-18.2.1 | — |
| AC-4 persist | TC-18.1.4 | — | — |
| AC-5 pane | — | TC-18.2.1 | TC-18.3.1 |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M10a green.
- **Exit (Done)**: all TCs pass; backend coverage ≥90% (global gate); lint/typecheck/boundary green; code + **visual review** (Memory: save, recall, list, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Save-a-note composer; recent list (newest first) with forget (×)
- [ ] Recall search; relevant note ranks first
- [ ] Brand tokens light + dark; screenshots committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixtures: a temp JSON file; a few notes; a recall query.
