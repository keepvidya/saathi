# QA — 04-office-slides

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Exported .pptx invalid / loses titles or bullets | M | H | Integration: unzip + assert slide XML |
| Editing a slide doesn't update the model | M | M | Frontend integration (edit → deck → export) |
| Switching slides loses edits | M | M | Frontend integration |
| Office switcher breaks Sheets/Docs | L | M | Switcher integration + e2e |
| pptxgenjs leaks past the adapter | L | M | Boundary check (CI) |

## 2. Test approach by level
- **Unit (domain)**: `deckPlainText`, `sampleDeck` shape. Target 100%.
- **Integration (backend)**: pptx adapter — export `sampleDeck`, unzip, assert `ppt/slides/slide1.xml` contains the title and a bullet.
- **Integration (frontend)**: slides editor renders the active slide; switching thumbnails changes the slide; editing the title updates the model so export carries it; Download invokes the bridge.
- **E2E**: launch → Office → Slides; slide visible; switch slides; switch to Sheets/Docs and back; Download .pptx present.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 render slide | TC-04.1.1 | TC-04.2.2 | TC-04.3.1 |
| AC-2 multi-slide | — | TC-04.2.2 | TC-04.3.1 |
| AC-3 switcher | — | TC-04.2.3 | TC-04.3.1 |
| AC-4 .pptx export | — | TC-04.2.1 | (control present) |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M3 green.
- **Exit (Done)**: all TCs pass; domain coverage ≥90%; lint/typecheck/boundary green; code + **visual review** (slide canvas + strip, light + dark; Sheets/Docs intact); screenshots committed.

## 5. Visual review checklist
- [ ] Slide canvas (16:9) with title + bullets; slide strip with thumbnails + "＋"
- [ ] Switching thumbnails changes the active slide
- [ ] Office Sheets/Docs/Slides switcher works; Sheets totals + Docs heading still correct
- [ ] Brand tokens in light + dark; Download .pptx visible
- [ ] Screenshots (slides light + dark) committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixture: `sampleDeck()` — a 3-slide "Q3 Investor Update".
