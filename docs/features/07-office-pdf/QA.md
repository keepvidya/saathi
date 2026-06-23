# QA — 07-office-pdf

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Exported PDF invalid / loses text | M | H | Integration: %PDF header + text + size |
| Font-encoding crash (em-dash etc.) | M | M | Export the sample (has an em-dash) without throwing |
| Long text overflows the page | M | M | Word-wrap + pagination in the adapter |
| Download wiring broken | L | M | Frontend integration + e2e |
| pdf-lib leaks past the adapter | L | M | Boundary check (CI) |

## 2. Test approach by level
- **Integration (backend)**: `toPdf(sampleDoc())` → `Uint8Array`, starts with `%PDF`, contains `Project Proposal`, size > 500 bytes; does not throw on the em-dash.
- **Integration (frontend)**: the Docs editor shows a Download PDF button that invokes `bridge.exportPdf` with serialized DocData.
- **E2E**: Office → Docs → the Download PDF control is visible.

## 3. Coverage matrix
| AC | Integration | E2E |
|---|---|---|
| AC-1 control + wired | TC-07.2.2 | TC-07.3.1 |
| AC-2 valid PDF + text | TC-07.2.1 | — |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M5 green.
- **Exit (Done)**: all TCs pass; lint/typecheck/boundary green; code + **visual review** (Docs toolbar with Download PDF, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Docs toolbar shows Download .docx and Download PDF
- [ ] Brand tokens light + dark
- [ ] (Manual/automated) the produced PDF opens and shows the heading + paragraphs
- [ ] Screenshot (docs toolbar) committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixture: `sampleDoc()` (has a heading, paragraphs, an em-dash, a bold run).
