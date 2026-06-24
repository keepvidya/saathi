# QA — 19-skills (M10c)

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Skill builds the wrong goal/answer | M | **H** | per-skill `toGoal` + `runSkill` units |
| Malformed input crashes | M | M | fallback-to-raw units |
| Catalogue not shown / un-runnable | L | M | pane integration |
| Answer invented | L | **H** (DNA) | answers via `runDefaultAgent` (real tools) |

## 2. Test approach by level
- **Unit (domain)**: the registry lists builtins (unique ids); each skill's `toGoal` builds the expected goal and `runSkill` returns the exact computed answer (calc 150, percent 36, tip 35.4, average 20, define HTTP); malformed input → raw fallback.
- **Integration (frontend)**: the Skills pane renders a card per skill; running a skill with an input shows the computed answer + the built goal; a non-numeric input degrades gracefully.
- **E2E**: open Skills → run a skill (Percentage / Tip) → the computed answer appears.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 catalogue | TC-19.1.1 | TC-19.2.1 | TC-19.3.1 |
| AC-2 run/compute | TC-19.1.2 | TC-19.2.2 | TC-19.3.1 |
| AC-3 show goal | — | TC-19.2.2 | — |
| AC-4 robust | TC-19.1.3 | — | — |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M10b green.
- **Exit (Done)**: all TCs pass; domain coverage ≥90% (global gate); lint/typecheck/boundary green; code + **visual review** (Skills: cards + a run result, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Skill cards (name, description, example)
- [ ] Run a skill → computed answer + the built goal shown
- [ ] Brand tokens light + dark; screenshots committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixtures: the builtin skills; example inputs (15% of 240; 120, 4, 18).
