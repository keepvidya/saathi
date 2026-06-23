# QA — 06-office-home

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Create/Template/Recent routes to the wrong editor | M | M | Integration: each card → correct editor |
| Back button doesn't return home | L | M | Integration + e2e |
| New routing regresses M2–M4b (switcher / AI build / export) | M | H | Integration + e2e through the editor |
| Recent grows unbounded / duplicates | L | L | Unit/integration cap + dedupe |

## 2. Test approach by level
- **Integration (frontend)**: home renders Create-new cards + Templates + Recent; clicking each opens the right editor; back returns home; from the editor the switcher + AI build still function; recent updates + dedupes/caps.
- **E2E**: launch → Office (home) → click Slides card → slide editor → back → home; click a template → editor.

## 3. Coverage matrix
| AC | Integration | E2E |
|---|---|---|
| AC-1 create cards | TC-06.1.1 | TC-06.2.1 |
| AC-2 templates | TC-06.1.2 | (e2e optional) |
| AC-3 recent | TC-06.1.3 | — |
| AC-4 back + editors intact | TC-06.1.4 | TC-06.2.1 |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M4b green.
- **Exit (Done)**: all TCs pass; lint/typecheck/boundary green; code + **visual review** (home light + dark; editor reachable + back); screenshots committed.

## 5. Visual review checklist
- [ ] Home: hero + local badge + Create-new cards (per-type colour) + Templates + Recent
- [ ] Clicking a card opens the right editor; "← Office" returns home
- [ ] Sheets/Docs/Slides switcher + AI build still work from the editor
- [ ] Brand tokens light + dark
- [ ] Screenshots (home light + dark) committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Seeded recents: a couple of example items so Recent isn't empty on first view.
