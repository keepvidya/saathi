# DEV — 17-agent (M10a)

## 1. Approach
All in `@saathi/domain/agent` (alongside the M4b build agents). A **`Tool`** is `{ name, description, run(input): string }` — a pure worker. **`ToolRegistry`** holds them. **Builtin tools** wrap real engines: **`calc`** evaluates an arithmetic expression with the M2 **formula engine** (`evalFormula`, no `eval`); **`search`** answers from a seeded **knowledge `Corpus`** (`retrieve` + `composeAnswer`, extractive + cited). The **`runAgent`** ReAct loop asks a **`Planner`** for the next step (a tool call or a final answer), runs the tool, feeds the observation back, and records an ordered **step trace**; it is **bounded** by `maxSteps`. The default **`RulefulPlanner`** is deterministic (our supervisor's routing): math-looking goals → `calc`; questions → `search`; otherwise a helpful default. No LLM in the core — a model can narrate/route later behind `Planner`.

## 2. Ports & seams
- `Tool { name; description; run(input: string): string }` (pure, sync).
- `Planner { plan(goal, observations): PlanDecision }` — `PlanDecision = { kind:'tool'; call:{tool,input}; reason } | { kind:'final'; answer; reason }`.
- No IPC/backend (the agent runs in the renderer over pure domain logic; a model narrator would reuse the existing `LlmPort`/bridge later).

## 3. Domain model
- `AgentStep { phase:'reason'|'act'|'observe'|'answer'; agent: string; text: string }`; `AgentResult { steps: AgentStep[]; answer: string }`.
- `runAgent(goal, planner, registry, maxSteps=5): AgentResult`.
- `builtinTools(): Tool[]` (calc, search) + `defaultRegistry()`.

## 4. Data structures & complexity (DSA)
| Operation | Time | Notes |
|---|---|---|
| Route (plan) | O(1) | regex tests |
| calc | O(n) | formula parse, n = expr length |
| search | O(N) | TF-IDF over the seeded corpus |
| ReAct loop | O(steps) | bounded by `maxSteps` |

## 5. Design patterns
- **Command/Strategy** (`Tool`), **Registry** (`ToolRegistry`), **Strategy** (`Planner`: ruleful now, LLM later), **Template method** (`runAgent` fixed loop, pluggable planner), **Facade** (`defaultRegistry`), **narrator** (tools compute, supervisor routes/phrases).

## 6. External modules (Wrapper Rule)
None — pure domain, reusing the formula engine + knowledge retrieval already in `@saathi/domain`.

## 7. Flow / sequence
`runAgent(goal)` → loop: `planner.plan(goal, obs)` → record **reason**; if `tool` → record **act**, `registry.get(tool).run(input)` → record **observe**, push the observation; if `final` (or `maxSteps` hit) → record **answer**, return. The pane renders the trace (phase-styled) + the final answer.

## 8. Error handling
A bad calc expression → the formula engine's error value (`#ERR`/`#DIV/0`) is the observation (no throw). An unknown tool → an "unknown tool" observation. Empty goal → a helpful default answer. The bound prevents runaway loops.

## 9. Risks & mitigations
- **Made-up answers** → answers are tool outputs (engine results / extractive cited text), never the planner's invention.
- **Runaway loop** → `maxSteps` bound; the ruleful planner finalises after one observation for single-tool tasks.
- **Routing mistakes** → deterministic + unit-tested; the trace makes the route visible.

## 10. ADRs
No new ADR (reuses ADR-0004 domain). An LLM planner / MCP tools / memory may warrant one later.
