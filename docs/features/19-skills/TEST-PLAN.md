# TEST PLAN — 19-skills (M10c)

- **Plan id**: TP-19
- **Items under test**: `@saathi/domain/agent/skills` (`Skill`, `SkillRegistry`, `BUILTIN_SKILLS`, `runSkill`), the Skills pane.
- **Approach**: unit (domain) + integration (pane) + e2e.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-19.1 — Skills (UNIT · domain)

### TC-19.1.1 — registry
| # | Action | Expected |
|---|---|---|
| 1 | `new SkillRegistry().list()` | the builtin skills, unique ids |

### TC-19.1.2 — skills compute the right answer
| # | Action | Expected |
|---|---|---|
| 1 | `runSkill(calc, '12.5 * (8 + 4)')` | answer `'150'` |
| 2 | `percent.toGoal('15% of 240')` / `runSkill` | `'(240 * 15 / 100)'` / `'36'` |
| 3 | `runSkill(tip, '120, 4, 18')` | `'35.4'` |
| 4 | `avg.toGoal('10, 20, 30')` / `runSkill` | `'AVERAGE(10,20,30)'` / `'20'` |
| 5 | `runSkill(define, 'HTTP')` | a grounded answer mentioning HTTP |

### TC-19.1.3 — robust inputs
| # | Action | Expected |
|---|---|---|
| 1 | `percent.toGoal('hello')` | the raw input (no crash) |
| 2 | `avg.toGoal('nothing')` | the raw input |

---
## Suite TS-19.2 — Skills pane (INTEGRATION)

### TC-19.2.1 — catalogue
| # | Action | Expected |
|---|---|---|
| 1 | render Skills | a card per builtin skill (name + description + example) |

### TC-19.2.2 — run a skill
| # | Action | Expected |
|---|---|---|
| 1 | in the Percentage card, type `15% of 240`; Run | the result shows `36` and the built goal `(240 * 15 / 100)` |

---
## Suite TS-19.3 — Flow (E2E · Playwright-Electron)

### TC-19.3.1 — run a skill
| # | Action | Expected |
|---|---|---|
| 1 | launch → Skills; run the Tip splitter with `120, 4, 18` | the answer `35.4` appears (light + dark screenshots) |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-19.1.1, TC-19.2.1, TC-19.3.1 |
| AC-2 | TC-19.1.2, TC-19.2.2, TC-19.3.1 |
| AC-3 | TC-19.2.2 |
| AC-4 | TC-19.1.3 |
