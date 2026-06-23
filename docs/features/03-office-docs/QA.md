# QA — 03-office-docs

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Exported .docx invalid / loses text or marks | M | H | Integration: unzip + assert document.xml |
| HTML→DocData serializer drops formatting | M | M | Unit: htmlToDoc (headings, marks) |
| Text injection via doc content | L | H | Unit: docToHtml escapes `& < >` |
| Office switcher breaks Sheets (M2 regression) | L | M | Integration + e2e both editors |
| docx leaks past the adapter | L | M | Boundary check (CI) |

## 2. Test approach by level
- **Unit (domain)**: `docToHtml` (structure + escaping), `docPlainText`. Target 100%.
- **Unit (frontend)**: `htmlToDoc` round-trips headings + bold/italic/underline runs.
- **Integration (backend)**: docx adapter — export `sampleDoc`, unzip, assert `word/document.xml` contains the heading text and a `<w:b/>` bold run.
- **Integration (frontend)**: Office switcher toggles Sheets ↔ Docs; Docs page renders the model; Download invokes the bridge.
- **E2E**: launch → Office → Docs visible with heading; switch to Sheets and back; Download .docx control present.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 render doc | TC-03.1.1 | TC-03.2.2 | TC-03.3.1 |
| AC-2 formatting | TC-03.1.2 (htmlToDoc) | — | (visual) |
| AC-3 switcher | — | TC-03.2.3 | TC-03.3.1 |
| AC-4 .docx export | — | TC-03.2.1 | (control present) |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M2 green.
- **Exit (Done)**: all TCs pass; domain+serializer coverage ≥90%; lint/typecheck/boundary green; code + **visual review** (Docs page + toolbar, light + dark; Sheets still works); screenshots committed.

## 5. Visual review checklist
- [ ] Docs page renders heading + paragraphs; reads like a Word page (serif headings, comfortable measure)
- [ ] Toolbar Bold/Italic/Underline + heading buttons work on a selection
- [ ] Office Sheets/Docs switcher works; Sheets (M2) still correct
- [ ] Brand tokens in light + dark; Download .docx visible
- [ ] Screenshots (docs light + dark) committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixture: `sampleDoc()` — a "Project Proposal" with an H1, paragraphs, and a bold run.
