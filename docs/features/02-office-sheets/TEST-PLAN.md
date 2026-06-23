# TEST PLAN — 02-office-sheets

- **Plan id**: TP-02
- **Items under test**: `@saathi/domain` (cell-ref, formula engine, Sheet), `@saathi/backend` ExcelJS export adapter, frontend Sheets grid, `sheet:exportXlsx` IPC
- **Approach**: unit (domain) + integration (backend + frontend) + e2e.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-02.1 — Formula engine (UNIT · domain)

### TC-02.1.1 — Cell refs & ranges
| # | Action | Expected |
|---|---|---|
| 1 | `parseRef('B2')` | `{col:1,row:2}` |
| 2 | `formatRef({col:4,row:1})` | `'E1'` |
| 3 | `expandRange('B2','D2')` | `['B2','C2','D2']` |

### TC-02.1.2 — Arithmetic & precedence
| # | Action | Expected |
|---|---|---|
| 1 | `=2+3*4` | `14` |
| 2 | `=(2+3)*4` | `20` |
| 3 | `=10/4` | `2.5` |

### TC-02.1.3 — Cell refs in formulas
| # | Action | Expected |
|---|---|---|
| 1 | B2=120,C2=150,D2=177; eval `=B2+C2+D2` | `447` |
| 2 | eval `=B2-C2` | `-30` |

### TC-02.1.4 — Functions over ranges
| # | Action | Expected |
|---|---|---|
| 1 | `=SUM(B2:D2)` | `447` |
| 2 | `=AVERAGE(B2:D2)` | `149` |
| 3 | `=MIN(B2:D2)` / `=MAX(B2:D2)` | `120` / `177` |
| 4 | `=COUNT(B2:D2)` | `3` |

### TC-02.1.5 — Dependency chains recompute
| # | Action | Expected |
|---|---|---|
| 1 | E2=`=SUM(B2:D2)`; display(E2) | `447` |
| 2 | setRaw(B2,'100'); recompute; display(E2) | `427` |

### TC-02.1.6 — Errors never crash
| # | Action | Expected |
|---|---|---|
| 1 | `=1/0` | `#DIV/0` |
| 2 | `=A1` where A1=`=A1` (self-ref) | `#CIRC` |
| 3 | `=SUM(` (malformed) | `#ERR` |

---
## Suite TS-02.2 — Export & grid (INTEGRATION)

### TC-02.2.1 — ExcelJS export round-trips (backend)
| # | Action | Expected |
|---|---|---|
| 1 | `toXlsx(budgetSheet)` → buffer | non-empty `Uint8Array` |
| 2 | re-open buffer with ExcelJS | cell A1 = 'Item'; B2 = 120 |
| 3 | read the Total cell (E2) | equals the computed `447` |

### TC-02.2.2 — Grid edits recompute; header frozen (frontend)
| # | Action | Expected |
|---|---|---|
| 1 | render Sheets pane with the budget fixture | grid shows column letters + rows; E2 cell shows `447`; header row element is `.frozen`/sticky |
| 2 | set B2 to `100` via the grid | E2 re-renders `427`; formula bar of E2 shows `=SUM(B2:D2)` |

---
## Suite TS-02.3 — Flows (E2E · Playwright-Electron)

### TC-02.3.1 — Open Sheets, see data
| # | Action | Expected |
|---|---|---|
| 1 | launch → click Office (Sheets) | grid visible with the budget data |

### TC-02.3.2 — Live recompute
| # | Action | Expected |
|---|---|---|
| 1 | edit B2 to 100 | the Total (E2) updates from 447 to 427 |

### TC-02.3.3 — Export control present
| # | Action | Expected |
|---|---|---|
| 1 | the "Download .xlsx" button is visible and wired to the bridge | clicking calls `sheet:exportXlsx` (Save dialog opens) |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-02.1.1, TC-02.2.2, TC-02.3.1 |
| AC-2 | TC-02.1.2–.6, TC-02.2.2, TC-02.3.2 |
| AC-3 | TC-02.2.2 (visual) |
| AC-4 | TC-02.2.1, TC-02.3.3 |
