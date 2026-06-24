# TEST PLAN — 16-browser-shields (M9b)

- **Plan id**: TP-16
- **Items under test**: `@saathi/domain/shields` (`Shields`, `STARTER_FILTERS`), `desktop/main` `AdBlock` + `browser:toggleShields`, the Browser pane Shields badge/toggle.
- **Approach**: unit (domain) + integration (pane) + e2e + CI hygiene.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-16.1 — Domain (UNIT)

### TC-16.1.1 — Shields tally
| # | Action | Expected |
|---|---|---|
| 1 | new Shields | `state() == { enabled:true, blocked:0 }` |
| 2 | `recordBlocked(); recordBlocked(2)` | `blocked == 3` |
| 3 | `toggle()` → false; `recordBlocked()` | disabled; `blocked` unchanged |
| 4 | `setEnabled(true)` | re-enabled |

### TC-16.1.2 — starter filters block known trackers (core engine)
| # | Action | Expected |
|---|---|---|
| 1 | parse `STARTER_FILTERS`; match `doubleclick.net` script | **blocked** |
| 2 | match `google-analytics.com` | **blocked** |
| 3 | match `example.com/app.js` | **allowed** |

---
## Suite TS-16.2 — Browser pane Shields (INTEGRATION · injected port)

### TC-16.2.1 — badge reflects the pushed count
| # | Action | Expected |
|---|---|---|
| 1 | push a snapshot with `shields:{enabled:true,blocked:7}` | the 🛡 badge shows `7` |

### TC-16.2.2 — toggle
| # | Action | Expected |
|---|---|---|
| 1 | click the Shields button | `toggleShields` called |
| 2 | push `shields:{enabled:false,blocked:7}` | the button shows the off state (`.off`) |

---
## Suite TS-16.3 — Flow (E2E · Playwright-Electron)

### TC-16.3.1 — blocks a tracker; toggle off
| # | Action | Expected |
|---|---|---|
| 1 | Browser → navigate a `data:` page referencing `doubleclick.net` | the blocked count badge becomes ≥ 1 |
| 2 | click Shields to toggle off | the button shows the off state (light + dark screenshots) |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-16.1.2, TC-16.3.1 |
| AC-2 | TC-16.1.1, TC-16.2.1, TC-16.3.1 |
| AC-3 | TC-16.1.1, TC-16.2.2, TC-16.3.1 |
| AC-4 | CI hygiene / review |
