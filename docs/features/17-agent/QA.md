# QA — 17-agent (M10a)

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Wrong/invented answer | M | **H** (DNA) | answers come from real tools (unit) |
| Wrong tool chosen | M | M | `RulefulPlanner` routing unit |
| Runaway loop | L | **H** | `maxSteps` bound unit |
| Bad input crashes | M | M | calc error value; unknown tool observation |

## 2. Test approach by level
- **Unit (domain)**: `calc` tool returns the exact result (and an error value for bad input); `search` tool returns a grounded answer from the seeded corpus; `runAgent` routes a math goal → calc → answer, a question goal → search → answer, records the full step trace, respects `maxSteps`, and handles an unknown tool / empty goal.
- **Integration (frontend)**: the Agent pane renders the step trace + final answer on submit; calc + search goals produce the right answer in the UI.
- **E2E**: open Agent → submit a calc goal → the answer (exact) + steps appear.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 calc | TC-17.1.1, TC-17.1.3 | TC-17.2.1 | TC-17.3.1 |
| AC-2 search | TC-17.1.2, TC-17.1.3 | TC-17.2.1 | — |
| AC-3 trace/bound | TC-17.1.3, TC-17.1.4 | — | TC-17.3.1 |
| AC-4 pane | — | TC-17.2.1 | TC-17.3.1 |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M9b green.
- **Exit (Done)**: all TCs pass; domain coverage ≥90% (global gate); lint/typecheck/boundary green; code + **visual review** (Agent: goal, step trace, answer, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Goal input; submit
- [ ] Step trace (reason/act/observe/answer, agent-labelled, phase-styled)
- [ ] Final answer; calc result exact, search answer grounded
- [ ] Brand tokens light + dark; screenshots committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixtures: a seeded knowledge corpus (a few facts); calc + question goals.
