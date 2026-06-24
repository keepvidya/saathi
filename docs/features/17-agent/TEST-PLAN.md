# TEST PLAN — 17-agent (M10a)

- **Plan id**: TP-17
- **Items under test**: `@saathi/domain/agent` (`Tool`, `ToolRegistry`, builtin `calc`/`search`, `runAgent`, `RulefulPlanner`), the Agent pane.
- **Approach**: unit (domain) + integration (pane) + e2e.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-17.1 — Agent core (UNIT · domain)

### TC-17.1.1 — calc tool (real formula engine)
| # | Action | Expected |
|---|---|---|
| 1 | `calc.run('12.5 * (8 + 4)')` | `'150'` |
| 2 | `calc.run('SUM(10,20,30)')` | `'60'` |
| 3 | `calc.run('1/0')` | an error value (`#DIV/0`), no throw |

### TC-17.1.2 — search tool (knowledge retrieval)
| # | Action | Expected |
|---|---|---|
| 1 | `search.run('what is photosynthesis')` | an answer containing source text (grounded) |

### TC-17.1.3 — runAgent routes + traces
| # | Action | Expected |
|---|---|---|
| 1 | `runAgent('12.5 * (8 + 4)')` | answer `'150'`; steps include reason → act(calc) → observe → answer |
| 2 | `runAgent('what is photosynthesis?')` | uses `search`; grounded answer |
| 3 | a goal needing no tool | a helpful default answer; no tool act |

### TC-17.1.4 — bounded loop + robustness
| # | Action | Expected |
|---|---|---|
| 1 | a planner that always returns a tool call | `runAgent` stops at `maxSteps` and still answers |
| 2 | a planner returning an unknown tool | the observation notes the unknown tool; no throw |

---
## Suite TS-17.2 — Agent pane (INTEGRATION)

### TC-17.2.1 — submit → trace + answer
| # | Action | Expected |
|---|---|---|
| 1 | render Agent; type `12.5 * (8 + 4)`; submit | a step trace renders; the answer shows `150` |
| 2 | type `what is photosynthesis?`; submit | a grounded answer renders (search) |

---
## Suite TS-17.3 — Flow (E2E · Playwright-Electron)

### TC-17.3.1 — Agent: goal → answer
| # | Action | Expected |
|---|---|---|
| 1 | launch → Agent; submit a calc goal | the step trace + the exact answer appear (light + dark screenshots) |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-17.1.1, TC-17.1.3, TC-17.2.1, TC-17.3.1 |
| AC-2 | TC-17.1.2, TC-17.1.3, TC-17.2.1 |
| AC-3 | TC-17.1.3, TC-17.1.4, TC-17.3.1 |
| AC-4 | TC-17.2.1, TC-17.3.1 |
