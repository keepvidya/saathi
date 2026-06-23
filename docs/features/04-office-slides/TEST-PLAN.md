# TEST PLAN — 04-office-slides

- **Plan id**: TP-04
- **Items under test**: `@saathi/domain` deck model (`deckPlainText`/`sampleDeck`), frontend Slides editor + Office switcher, `@saathi/backend` pptxgenjs adapter, `slide:exportPptx` IPC
- **Approach**: unit (domain) + integration (backend + frontend) + e2e.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-04.1 — Deck model (UNIT · domain)

### TC-04.1.1 — sampleDeck + deckPlainText
| # | Action | Expected |
|---|---|---|
| 1 | `sampleDeck()` | `title` set; `slides.length >= 3`; slide 1 has a title + ≥1 bullet |
| 2 | `deckPlainText(sampleDeck())` | contains the deck title and a bullet's text |

---
## Suite TS-04.2 — Export & editor (INTEGRATION)

### TC-04.2.1 — pptx export round-trips (backend)
| # | Action | Expected |
|---|---|---|
| 1 | `toPptx(sampleDeck())` → bytes | `Uint8Array`, zip magic `PK`, non-empty |
| 2 | unzip → `ppt/slides/slide1.xml` | contains the first slide's title |
| 3 | the slide XML | contains a bullet's text |

### TC-04.2.2 — Slides editor renders, switches, edits (frontend)
| # | Action | Expected |
|---|---|---|
| 1 | render Slides editor | `.slide-canvas` shows slide 1 title + bullets; slide strip has N thumbs + "＋" |
| 2 | click thumbnail 2 | canvas shows slide 2's title |
| 3 | edit the title; click Download (bridge mocked) | the exported DeckData carries the edited title |

### TC-04.2.3 — Office switcher includes Slides
| # | Action | Expected |
|---|---|---|
| 1 | render Office | tabs Sheets / Docs / Slides present; default Sheets |
| 2 | click "Slides" | `.slide-canvas` present; `.sheets`/`.docpage` gone |
| 3 | click "Sheets" | grid back; E2 shows `447` (M2 intact) |

---
## Suite TS-04.3 — Flows (E2E · Playwright-Electron)

### TC-04.3.1 — Office Slides: render, switch, export control
| # | Action | Expected |
|---|---|---|
| 1 | launch → Office → Slides | slide canvas visible with the title |
| 2 | click slide thumbnail 2 | active slide changes |
| 3 | switch to Sheets then Docs | both render; no errors |
| 4 | the "Download .pptx" button | visible & wired to the bridge |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-04.1.1, TC-04.2.2, TC-04.3.1 |
| AC-2 | TC-04.2.2, TC-04.3.1 |
| AC-3 | TC-04.2.3, TC-04.3.1 |
| AC-4 | TC-04.2.1 |
