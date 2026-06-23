# TEST PLAN — 06-office-home

- **Plan id**: TP-06
- **Items under test**: `renderOffice` home/editor routing, `renderHome`, Recent tracking, back control
- **Approach**: integration (frontend) + e2e.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-06.1 — Office home routing (INTEGRATION · frontend)

### TC-06.1.1 — Create-new cards open the right editor
| # | Action | Expected |
|---|---|---|
| 1 | render Office | home shows: Create-new cards (sheets/docs/slides), Templates, Recent |
| 2 | click the "Spreadsheet" card | Sheets editor (`.sheets`, `td[data-ref="E2"]`=447) |
| 3 | back; click "Presentation" | Slides editor (`.slide-canvas`) |

### TC-06.1.2 — Templates open the matching editor
| # | Action | Expected |
|---|---|---|
| 1 | click the "Business letter" template | Docs editor (`.docpage h1`) |
| 2 | back; click "Pitch deck" | Slides editor |

### TC-06.1.3 — Recent updates + reopens
| # | Action | Expected |
|---|---|---|
| 1 | open a couple of types | each appears under Recent (deduped, capped) |
| 2 | click a Recent item | reopens that editor |

### TC-06.1.4 — Back + editors intact
| # | Action | Expected |
|---|---|---|
| 1 | open Sheets → click "← Office" | home shows again |
| 2 | open Docs; switch tab to Slides; run AI build | switcher + AI build still work (`.slide-canvas` after build) |

---
## Suite TS-06.2 — Flow (E2E · Playwright-Electron)

### TC-06.2.1 — Home → editor → back
| # | Action | Expected |
|---|---|---|
| 1 | launch → Office | the home launchpad is visible |
| 2 | click the Presentation card | the slide editor opens |
| 3 | click "← Office" | the home shows again |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-06.1.1, TC-06.2.1 |
| AC-2 | TC-06.1.2 |
| AC-3 | TC-06.1.3 |
| AC-4 | TC-06.1.4, TC-06.2.1 |
