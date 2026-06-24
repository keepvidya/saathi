# TEST PLAN — 11-learn-math

- **Plan id**: TP-11
- **Items under test**: `@saathi/domain/learn` (`math` block, `lessonPlainText`, `sampleLesson`), `@saathi/frontend/adapters/katex` (`KatexMath`, `PlainMath`), Learn pane math rendering.
- **Approach**: unit (domain + adapter) + integration (pane) + e2e + CI boundary.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-11.1 — Math model + adapter (UNIT)

### TC-11.1.1 — KaTeX renders valid TeX
| # | Action | Expected |
|---|---|---|
| 1 | `new KatexMath().toHtml('a^2+b^2=c^2', true)` | output contains `class="katex` and `katex-display` (display mode) |
| 2 | `toHtml('x_i', false)` | KaTeX markup, no `katex-display` (inline) |
| 3 | `sampleLesson()` | includes a `math` block |

### TC-11.1.2 — fallback + safety
| # | Action | Expected |
|---|---|---|
| 1 | `toHtml('\\frac{1}{', true)` (malformed) | does not throw; returns a string |
| 2 | `new PlainMath().toHtml('<b>x</b>', false)` | escaped source (`&lt;b&gt;x&lt;/b&gt;`), no HTML injection |
| 3 | `lessonPlainText(sampleLesson())` | does **not** contain the math TeX |

---
## Suite TS-11.2 — Learn pane math (INTEGRATION)

### TC-11.2.1 — renders a math block
| # | Action | Expected |
|---|---|---|
| 1 | render Learn with a lesson containing a math block (real `KatexMath`) | a `.lsn-math` exists containing `.katex` markup |

### TC-11.2.2 — injected fallback renders source
| # | Action | Expected |
|---|---|---|
| 1 | render Learn with `{ math: PlainMath }` and a math block | `.lsn-math` shows the escaped TeX source (no throw) |

---
## Suite TS-11.3 — Flow (E2E · Playwright-Electron)

### TC-11.3.1 — Learn shows typeset math
| # | Action | Expected |
|---|---|---|
| 1 | launch → Learn | a `.lsn-math .katex` element is visible |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-11.1.1, TC-11.2.1, TC-11.3.1 |
| AC-2 | TC-11.1.2, TC-11.2.2 |
| AC-3 | CI boundary (ESLint + dependency-cruiser) |
