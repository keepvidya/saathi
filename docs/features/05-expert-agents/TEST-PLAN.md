# TEST PLAN — 05-expert-agents

- **Plan id**: TP-05
- **Items under test**: `@saathi/domain` agent (`LlmPort`/`TemplateLlm`/validators/`runBuild`+experts), `@saathi/backend` `OllamaLlm`, frontend AI-build panel + `CompositeLlm`, `llm:narrate` IPC
- **Approach**: unit (domain + backend) + integration (frontend) + e2e.
- **Environment**: Win11, Node 22, Electron 33 (no Ollama → fallback). **Entry/exit**: see QA.md.

---
## Suite TS-05.1 — Agent core (UNIT · domain + backend)

### TC-05.1.1 — Build slides: valid + ReAct steps
| # | Action | Expected |
|---|---|---|
| 1 | `runBuild({type:'slides',brief:'Q3 results'}, TemplateLlm)` | `result.valid===true`; `result.deck` passes `validateDeck` |
| 2 | `result.steps` | includes phases reason, act, observe, validate, done (in order) |

### TC-05.1.2 — Build sheets & docs are valid
| # | Action | Expected |
|---|---|---|
| 1 | build sheets | `result.sheet` valid; its total cell evaluates to a number |
| 2 | build docs | `result.doc` has an h1 + a p |

### TC-05.1.3 — Numbers are COMPUTED, not invented (DNA)
| # | Action | Expected |
|---|---|---|
| 1 | `runBuild({type:'slides',brief:'Q3',numbers:[120,150,177]}, TemplateLlm)` | a slide bullet contains `Total: 447` (engine-computed `=SUM`) |
| 2 | the same with `[1,2,3]` | total bullet shows `6` (recomputed, not hard-coded) |

### TC-05.1.4 — Self-correction is bounded
| # | Action | Expected |
|---|---|---|
| 1 | build with a narrator that returns empty bullets | a `fix` step appears; final `valid===true`; ≤2 fix attempts (no loop) |

### TC-05.1.5 — Ollama adapter behind the port (backend)
| # | Action | Expected |
|---|---|---|
| 1 | `OllamaLlm.narrate` with mocked `fetch` → `{response:'a\nb'}` | returns `['a','b']` |
| 2 | fetch rejects / non-200 | returns `[]` (caller falls back) |

---
## Suite TS-05.2 — AI build panel (INTEGRATION · frontend)

### TC-05.2.1 — Build runs, shows steps, loads the editor
| # | Action | Expected |
|---|---|---|
| 1 | render Office; type a brief; click ✨ Build (no host → CompositeLlm falls back to TemplateLlm) | a step log renders with agent-labelled ReAct steps |
| 2 | after build | the editor for the active type shows the built draft (e.g. `.slide-canvas` title from the brief) |

---
## Suite TS-05.3 — Flow (E2E · Playwright-Electron)

### TC-05.3.1 — Office AI build end-to-end
| # | Action | Expected |
|---|---|---|
| 1 | launch → Office → Slides; type a brief; click Build | step log appears, then the slide canvas shows the built deck (editable) |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-05.1.1, TC-05.1.2, TC-05.2.1, TC-05.3.1 |
| AC-2 | TC-05.1.3 |
| AC-3 | TC-05.1.1, TC-05.2.1, TC-05.3.1 |
| AC-4 | TC-05.1.4 |
| AC-5 | TC-05.1.5, TC-05.2.1 |
