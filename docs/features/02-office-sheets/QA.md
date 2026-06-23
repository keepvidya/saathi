# QA — 02-office-sheets

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Formula returns a wrong number | M | **H** | Exhaustive domain unit tests |
| Circular reference loops/crashes | M | H | Cycle-detection unit test |
| Exported .xlsx is invalid / loses data | M | H | Integration: write→re-read→assert |
| Live recompute doesn't update dependents | M | M | Frontend integration |
| Frozen header not pinned | L | L | Visual review |
| ExcelJS leaks past the adapter | L | M | Boundary check (CI) |

## 2. Test approach by level
- **Unit (domain)**: cell-ref parse/format/range; evaluator — numbers, `+ - * / ()` precedence, refs, ranges, each function, dependency chains, `#ERR`/`#CIRC`/`#DIV/0`. Target 100% on the engine.
- **Integration (backend)**: ExcelJS adapter — export a `SheetData`, re-open the buffer with ExcelJS, assert cell values + that the total cell holds the computed result.
- **Integration (frontend)**: grid edit → dependent cell recomputes; formula bar shows raw formula; header row is sticky in markup.
- **E2E**: launch → Office/Sheets → edit a value → a SUM cell updates; the Download .xlsx control is present and invokes the bridge.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 enter data | TC-02.1.1 | TC-02.2.2 | TC-02.3.1 |
| AC-2 formulas + recompute | TC-02.1.2–.6 | TC-02.2.2 | TC-02.3.2 |
| AC-3 frozen header | — | TC-02.2.2 | (visual) |
| AC-4 .xlsx export | — | TC-02.2.1 | TC-02.3.3 |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M1 green; `@saathi/domain` scaffolded.
- **Exit (Done)**: all TCs pass; domain coverage ≥90% (target 100%); lint/typecheck/boundary green; code + **visual review** approved (grid + frozen header + formula bar, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Grid renders with column letters + row numbers; header row visually frozen on scroll
- [ ] Formula bar shows the active cell's raw formula; result shows in the cell
- [ ] Editing a value updates dependent totals live
- [ ] Brand tokens (copper selection, ink text) in light + dark
- [ ] Download .xlsx control visible; screenshots committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixture: the budget sheet (Item/Q1–Q3/Total, Sales/Costs/Profit) used across tests.
