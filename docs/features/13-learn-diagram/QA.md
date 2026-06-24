# QA — 13-learn-diagram

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Diagram not rendered / wrong | M | M | pane integration + e2e |
| Async render blocks/hides the lesson | M | **H** | progressive enhancement (source first) |
| Theme switch leaves stale colours | M | M | MutationObserver re-render |
| Invalid diagram crashes | M | **H** | catch → plain source fallback |
| Observer leaks after navigation | L | M | self-disconnect when root detached |
| Mermaid leaks outside its adapter | L | M | frontend Wrapper-Rule (CI boundary) |

## 2. Test approach by level
- **Unit (frontend adapter)**: `PlainDiagram` returns escaped source; `MermaidDiagram.render` returns a string and never throws (jsdom can't lay out SVG → it degrades to the fallback; real SVG is covered by e2e).
- **Integration (frontend)**: pane shows the diagram source immediately, then (with an injected port) swaps in the SVG; a `data-theme` change triggers a re-render with the new theme; `PlainDiagram` keeps the source (no throw).
- **E2E**: Learn shows a real Mermaid `svg`; switching theme keeps an `svg` (re-rendered), light + dark screenshots.
- **Boundary (CI)**: ESLint + dependency-cruiser fail if `mermaid` is imported outside `frontend/src/adapters`.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 render | — | TC-13.2.1 | TC-13.3.1 |
| AC-2 progressive/theme/fallback | TC-13.1.2 | TC-13.2.2, TC-13.2.3 | TC-13.3.1 |
| AC-3 boundary | — | — | CI boundary |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M8c green.
- **Exit (Done)**: all TCs pass; adapter coverage ≥90% (global gate); lint/typecheck/**boundary** green; code + **visual review** (diagram light + dark, re-render on switch); screenshots committed.

## 5. Visual review checklist
- [ ] Diagram (flowchart) rendered as SVG, on the brand surface
- [ ] Re-renders correctly on light↔dark switch (legible both)
- [ ] Invalid diagram shows its source (no broken layout)
- [ ] Screenshots (learn-diagram light + dark) committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixtures: `sampleLesson()` (now with a flowchart); an injected stub `DiagramRenderPort` for the swap/theme tests.
