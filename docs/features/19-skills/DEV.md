# DEV — 19-skills (M10c)

## 1. Approach
Pure in `@saathi/domain/agent/skills.ts`. A **`Skill`** is `{ id, name, description, inputLabel, example, toGoal(input): string }` — `toGoal` is a deterministic template that turns the user's input into an **agent goal** (e.g. "15% of 240" → `(240 * 15 / 100)`; "120, 4, 18" → `(120 * (1 + 18 / 100)) / 4`). **`runSkill(skill, input)`** = `runDefaultAgent(skill.toGoal(input))` — so the answer is computed by the existing real tools (calc / search), never invented. **`BUILTIN_SKILLS`** is a curated catalogue; **`SkillRegistry`** indexes them. The Skills pane lists the catalogue and runs a skill (input → `runSkill` → show the goal + answer).

## 2. Ports & seams
- No new ports/IPC/backend — skills compose the M10a agent, which is pure domain in the renderer.

## 3. Domain model
- `Skill`, `SkillRegistry`, `BUILTIN_SKILLS` (calc / define / percent / tip / avg), `runSkill(skill, input): AgentResult`.
- Number extraction: `nums(s)` pulls `-?\d+(.\d+)?`; malformed input → `toGoal` returns the raw text (the agent then gives a helpful default).

## 4. Data structures & complexity (DSA)
| Operation | Time | Notes |
|---|---|---|
| registry get/list | O(1)/O(n) | Map |
| toGoal | O(n) | regex over the input |
| runSkill | O(agent) | bounded ReAct (calc/search) |

## 5. Design patterns
- **Template method** (`toGoal`), **Registry** (`SkillRegistry`), **Composition** (skills build on the agent + tools), **Strategy** (each skill is a routing template), **narrator** (templates route; engines compute).

## 6. External modules (Wrapper Rule)
None — pure domain, reusing the agent + tools.

## 7. Flow / sequence
Skills pane → user picks a skill, enters input → `runSkill(skill, input)` → `skill.toGoal` builds the goal → `runDefaultAgent` routes to calc/search → `AgentResult` → render the built goal + the answer under the skill.

## 8. Error handling
Malformed input → `toGoal` returns the raw text → the agent's default/handling applies (no crash). Empty input → no run.

## 9. Risks & mitigations
- **Wrong template math** → each skill's `toGoal` + `runSkill` answer is unit-tested (percentage/tip/average exact).
- **Made-up answers** → answers come from `runDefaultAgent` (real tools), shown with the built goal for transparency.

## 10. ADRs
None (reuses ADR-0004 domain + the M10a agent). User-defined/persisted skills may warrant one later.
