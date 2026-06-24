# BA — 19-skills (M10c · Skills)

## 1. Problem & context
The Agent (M10a) is powerful but open-ended. **Skills** make its capabilities **discoverable and reusable**: a small catalogue of named recipes (Calculator, Look up, Percentage, Tip splitter, Average) you can run with one input. Each skill is a deterministic template that builds an agent goal and routes it to the **real** worker tools — so the answer is *computed*, not invented. (This completes "Agent + Skills + Memory".)

## 2. Users & jobs-to-be-done
- Primary: anyone who wants quick, repeatable helpers. Job: "When I have a common little task, I want a ready-made skill that just does it correctly."

## 3. User stories
- **US-1**: As a user, I see a **catalogue** of skills with what each does + an example.
- **US-2**: As a user, I **run** a skill with my input and get the computed answer.
- **US-3**: As a user, I can see the **goal** the skill built (transparency — the engine did the work).

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN the Skills pane THEN the builtin skills are listed with name/description/example. *(→ TC-19.2.1)*
- **AC-2** (US-2): GIVEN a skill + input WHEN I run it THEN it builds a goal, routes through the agent, and shows the **computed** answer (e.g. "15% of 240" → 36; "120, 4, 18" → 35.4). *(→ TC-19.1.2, TC-19.2.2, TC-19.3.1)*
- **AC-3** (US-3): GIVEN a run THEN the built goal is shown alongside the answer. *(→ TC-19.2.2)*
- **AC-4**: robustness — malformed input falls back to the raw text (no crash). *(→ TC-19.1.3)*

## 5. Scope
- **In**: a pure **`Skill`** + **`SkillRegistry`** + **`BUILTIN_SKILLS`** (calc / define / percentage / tip / average) + `runSkill` (`@saathi/domain`), composing the M10a agent; a real **Skills pane** (catalogue cards, per-skill input + Run + result) replacing the stub.
- **Out** (later): user-defined / learned skills + persistence (reuse Memory), editing skills, sharing, LLM-authored skills, side-effecting skills.

## 6. Success metrics / done-signal
Open Skills, run "Percentage" with "15% of 240" → 36; run "Tip splitter" with "120, 4, 18" → 35.4; the built goal is shown — all computed, offline.

## 7. Open questions / decisions for owner
- M10c ships a curated **builtin** catalogue. User-defined / learned skills (persisted via Memory) are a natural follow-on.
