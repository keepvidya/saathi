# TEST PLAN — 13-learn-diagram

- **Plan id**: TP-13
- **Items under test**: `@saathi/domain/learn` (`diagram` block, `sampleLesson`), `@saathi/frontend/adapters/mermaid` (`MermaidDiagram`, `PlainDiagram`), Learn pane diagram rendering + theme re-render.
- **Approach**: unit (adapter) + integration (pane) + e2e + CI boundary.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-13.1 — Diagram adapter (UNIT)

### TC-13.1.2 — fallback + safety
| # | Action | Expected |
|---|---|---|
| 1 | `await new PlainDiagram().render('graph TD; A-->B')` | `<pre>` with the escaped source |
| 2 | `await new MermaidDiagram().render('not a diagram', 'light')` | returns a string; does not throw (degrades to fallback in jsdom) |
| 3 | `sampleLesson()` | includes a `diagram` block |

---
## Suite TS-13.2 — Learn pane diagrams (INTEGRATION)

### TC-13.2.1 — source first, then SVG (injected port)
| # | Action | Expected |
|---|---|---|
| 1 | render Learn with a diagram lesson + a stub `diagram` resolving `'<svg id="d">SVG</svg>'` | `.lsn-diagram-body` shows the plain source synchronously |
| 2 | after the promise resolves | the body is replaced with the SVG (`svg` present) |

### TC-13.2.2 — theme switch re-renders
| # | Action | Expected |
|---|---|---|
| 1 | render with a stub `diagram` (spy) | called once with `'light'` |
| 2 | set `<html data-theme="dark">` | the spy is called again with `'dark'` |

### TC-13.2.3 — fallback renders source (PlainDiagram)
| # | Action | Expected |
|---|---|---|
| 1 | render with `{ diagram: PlainDiagram }` | source visible as escaped `<pre>`; no throw |

---
## Suite TS-13.3 — Flow (E2E · Playwright-Electron)

### TC-13.3.1 — Learn shows a Mermaid diagram
| # | Action | Expected |
|---|---|---|
| 1 | launch → Learn | a `.lsn-diagram svg` is visible (light screenshot) |
| 2 | switch to dark | a `.lsn-diagram svg` is still visible after re-render (dark screenshot) |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-13.2.1, TC-13.3.1 |
| AC-2 | TC-13.1.2, TC-13.2.2, TC-13.2.3, TC-13.3.1 |
| AC-3 | CI boundary (ESLint + dependency-cruiser) |
