# BA — 17-agent (M10a · Agent core)

## 1. Problem & context
The Agent is Saathi's "AI employee": you give it a goal, a **supervisor reasons** about it, **delegates to worker tools** that do the real work, observes the results, and answers — showing its work. Per our DNA, the **tools compute the truth** (our formula engine, our knowledge retrieval); the supervisor only *routes and narrates*. M10a is the walking skeleton: a tool-using **ReAct loop** with a couple of real tools. (M10b adds **Memory** (SQLite-FTS5); M10c adds **Skills**.)

## 2. Users & jobs-to-be-done
- Primary: anyone with a small task or question. Job: "When I give Saathi a goal, I want it to use the right tool and give me a correct, traceable answer."

## 3. User stories
- **US-1**: As a user, I type a goal and the agent **picks a tool**, runs it, and answers.
- **US-2**: As a user, I see the agent's **steps** (reason → act → observe → answer) so I can trust it.
- **US-3**: As a user, calculations are exact (a real engine) and answers come from my knowledge — not made up.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1/3): GIVEN a calculation goal THEN the agent routes to the **calc** tool (formula engine) and returns the exact result. *(→ TC-17.1.1, TC-17.1.3)*
- **AC-2** (US-1/3): GIVEN a question goal THEN the agent routes to the **search** tool (knowledge retrieval) and returns a grounded answer. *(→ TC-17.1.2, TC-17.1.3)*
- **AC-3** (US-2): GIVEN any run THEN the result includes an ordered **step trace** (reason/act/observe/answer); the loop is **bounded** (no runaway). *(→ TC-17.1.3, TC-17.1.4)*
- **AC-4** (US-2): GIVEN the Agent pane WHEN I submit a goal THEN the trace renders and the final answer is shown. *(→ TC-17.2.1, TC-17.3.1)*

## 5. Scope
- **In**: a pure **Tool** + **ToolRegistry** abstraction with real builtin tools (**calc** = the formula engine; **search** = knowledge retrieval over a seeded corpus) and a bounded **ReAct `runAgent`** with a deterministic **`RulefulPlanner`** (supervisor routing) — all `@saathi/domain`; an **Agent pane** (goal input, live step trace, answer) in `@saathi/frontend`.
- **Out** (→ later): **Memory** (SQLite-FTS5, M10b), **Skills** (M10c), an LLM-backed planner (the rule-based router is the deterministic core; a model can narrate later), MCP tools, multi-worker parallelism, tool side-effects (writing files, sending mail).

## 6. Success metrics / done-signal
Give the agent "12.5 * (8 + 4)" → it uses calc → **150**; give it "what is photosynthesis?" → it uses search → a grounded, cited answer; the steps are visible and the loop is bounded.

## 7. Open questions / decisions for owner
- M10a's supervisor is a **deterministic router** (our logic). An LLM planner + narration is a later enhancement behind the same `Planner` seam. Memory + Skills are separate slices.
