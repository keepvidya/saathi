# QA — 12-learn-code

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Code not highlighted / wrong tokens | M | M | Shiki adapter unit + pane integration |
| Async highlight blocks or hides the lesson | M | **H** | progressive enhancement (plain first) |
| Unknown language crashes | M | M | fallback-to-text, no throw |
| Shiki leaks outside its adapter | L | M | frontend Wrapper-Rule (CI boundary) |
| WASM blocked by CSP | L | M | JS RegExp engine (no WASM) |

## 2. Test approach by level
- **Unit (frontend adapter)**: `ShikiHighlight.highlight` returns Shiki markup with dual-theme CSS vars for a known language; an unknown language does not throw; `PlainHighlight` returns the escaped source in a `<pre>`.
- **Integration (frontend)**: Learn pane shows plain code immediately, then (with an injected highlight port) replaces the block body with the highlighted markup.
- **E2E**: Learn shows a real Shiki-highlighted code block (`.lsn-code .shiki` with coloured tokens), light + dark.
- **Boundary (CI)**: dependency-cruiser/ESLint fail if `shiki` is imported outside `frontend/src/adapters`.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 highlighted | TC-12.1.1 | TC-12.2.1 | TC-12.3.1 |
| AC-2 progressive/fallback | TC-12.1.2 | TC-12.2.2 | — |
| AC-3 boundary | — | — | CI boundary |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M8b green.
- **Exit (Done)**: all TCs pass; adapter coverage ≥90%; lint/typecheck/**boundary** green; code + **visual review** (highlighted code, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Code block syntax-highlighted (keywords/strings/numbers distinct)
- [ ] Readable in light + dark (token colours adapt via CSS vars)
- [ ] Brand surface/border + language label preserved around the highlighted code
- [ ] Screenshots (learn-code light + dark) committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixtures: `sampleLesson()` (has a JavaScript code block); a known snippet + an unknown-language case.
