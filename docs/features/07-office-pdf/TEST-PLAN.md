# TEST PLAN — 07-office-pdf

- **Plan id**: TP-07
- **Items under test**: `@saathi/backend` pdf-lib adapter (`PdfExportPort`), Docs-editor Download PDF, `doc:exportPdf` IPC
- **Approach**: integration (backend + frontend) + e2e.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-07.2 — Export & editor (INTEGRATION)

### TC-07.2.1 — pdf-lib export produces a valid, readable PDF (backend)
| # | Action | Expected |
|---|---|---|
| 1 | `toPdf(sampleDoc())` → bytes | `Uint8Array`, starts with `%PDF`, size > 500 |
| 2 | decode bytes | contains `Project Proposal` |
| 3 | export does not throw on the em-dash in the sample | resolves |

### TC-07.2.2 — Docs editor Download PDF invokes the bridge (frontend)
| # | Action | Expected |
|---|---|---|
| 1 | render Docs editor | a `#pdf-dl` (Download PDF) button is present |
| 2 | click it (bridge mocked) | `bridge.exportPdf` called with serialized DocData (h1 = the title) |

---
## Suite TS-07.3 — Flow (E2E · Playwright-Electron)

### TC-07.3.1 — Download PDF control present
| # | Action | Expected |
|---|---|---|
| 1 | launch → Office → Docs | the Download PDF button is visible (and Download .docx) |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-07.2.2, TC-07.3.1 |
| AC-2 | TC-07.2.1 |
