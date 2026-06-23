# TEST PLAN — 03-office-docs

- **Plan id**: TP-03
- **Items under test**: `@saathi/domain` doc model (`docToHtml`/`docPlainText`/`sampleDoc`), frontend `htmlToDoc` + Docs editor + Office switcher, `@saathi/backend` docx export adapter, `doc:exportDocx` IPC
- **Approach**: unit (domain + frontend) + integration (backend + frontend) + e2e.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-03.1 — Doc model (UNIT · domain + frontend)

### TC-03.1.1 — docToHtml renders & escapes
| # | Action | Expected |
|---|---|---|
| 1 | `docToHtml({blocks:[{type:'h1',runs:[{text:'Title'}]}]})` | contains `<h1>Title</h1>` |
| 2 | run with marks `['bold','italic','underline']` | wrapped in `<strong><em><u>…</u></em></strong>` (any nesting) |
| 3 | text `'a < b & c'` | escaped to `a &lt; b &amp; c` (no raw `<`/`&`) |
| 4 | `docPlainText(sampleDoc())` | contains `'Project Proposal'` |

### TC-03.1.2 — htmlToDoc serializes back (frontend)
| # | Action | Expected |
|---|---|---|
| 1 | a page el with `<h1>Title</h1><p>hi <strong>bold</strong></p>` | `{blocks:[{type:'h1',runs:[{text:'Title'}]},{type:'p',runs:[{text:'hi '},{text:'bold',marks:['bold']}]}]}` |
| 2 | `<em>`/`<u>` and inline `font-weight:bold` | produce italic/underline/bold marks |

---
## Suite TS-03.2 — Export & editor (INTEGRATION)

### TC-03.2.1 — docx export is a valid file with text + bold (backend)
| # | Action | Expected |
|---|---|---|
| 1 | `toDocx(sampleDoc())` → bytes | `Uint8Array`, zip magic `PK`, non-empty |
| 2 | unzip → `word/document.xml` | contains `Project Proposal` |
| 3 | the bold run | document.xml has a `<w:b` bold property |

### TC-03.2.2 — Docs editor renders the model (frontend)
| # | Action | Expected |
|---|---|---|
| 1 | render Docs editor | `.docpage` contains an `<h1>` with the title; paragraphs present; toolbar buttons exist |

### TC-03.2.3 — Office switcher toggles Sheets ↔ Docs
| # | Action | Expected |
|---|---|---|
| 1 | render Office (default Sheets) | `.sheets` present |
| 2 | click the "Docs" tab | `.docpage` present; `.sheets` gone |
| 3 | click "Sheets" | grid back; E2 shows `447` (M2 intact) |

---
## Suite TS-03.3 — Flows (E2E · Playwright-Electron)

### TC-03.3.1 — Office Docs visible; switch works
| # | Action | Expected |
|---|---|---|
| 1 | launch → Office → Docs tab | document page visible with the heading |
| 2 | switch to Sheets and back | both render; no errors |

### TC-03.3.2 — Export control present
| # | Action | Expected |
|---|---|---|
| 1 | the "Download .docx" button is visible & wired to the bridge | clicking calls `doc:exportDocx` |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-03.1.1, TC-03.2.2, TC-03.3.1 |
| AC-2 | TC-03.1.2 |
| AC-3 | TC-03.2.3, TC-03.3.1 |
| AC-4 | TC-03.2.1 |
