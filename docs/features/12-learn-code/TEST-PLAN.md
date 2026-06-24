# TEST PLAN — 12-learn-code

- **Plan id**: TP-12
- **Items under test**: `@saathi/frontend/adapters/shiki` (`ShikiHighlight`, `PlainHighlight`), Learn pane code highlighting.
- **Approach**: unit (adapter) + integration (pane) + e2e + CI boundary.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-12.1 — Highlight adapter (UNIT)

### TC-12.1.1 — Shiki highlights known code
| # | Action | Expected |
|---|---|---|
| 1 | `await new ShikiHighlight().highlight('const x = 1', 'javascript')` | contains `class="shiki` and `--shiki-dark` (dual-theme) |
| 2 | same output | contains a coloured token `<span style="--shiki-light` |

### TC-12.1.2 — fallback + safety
| # | Action | Expected |
|---|---|---|
| 1 | `highlight('x = 1', 'no-such-lang')` | does not throw; returns a string |
| 2 | `await new PlainHighlight().highlight('<b>x</b>', 'js')` | `<pre>` with escaped source `&lt;b&gt;x&lt;/b&gt;` |

---
## Suite TS-12.2 — Learn pane highlighting (INTEGRATION)

### TC-12.2.1 — plain first, then highlighted (injected port)
| # | Action | Expected |
|---|---|---|
| 1 | render Learn with a code lesson + a stub `highlight` resolving `'<pre class="shiki">HL</pre>'` | the `.lsn-code` shows the plain source synchronously |
| 2 | after the promise resolves | the block body is replaced with the highlighted markup (`.shiki` present) |

### TC-12.2.2 — fallback renders plain (PlainHighlight)
| # | Action | Expected |
|---|---|---|
| 1 | render with `{ highlight: PlainHighlight }` | code visible as escaped `<pre>`; no throw |

---
## Suite TS-12.3 — Flow (E2E · Playwright-Electron)

### TC-12.3.1 — Learn shows highlighted code
| # | Action | Expected |
|---|---|---|
| 1 | launch → Learn | a `.lsn-code .shiki` element with coloured token spans is visible (light + dark screenshots) |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-12.1.1, TC-12.2.1, TC-12.3.1 |
| AC-2 | TC-12.1.2, TC-12.2.2 |
| AC-3 | CI boundary (ESLint + dependency-cruiser) |
