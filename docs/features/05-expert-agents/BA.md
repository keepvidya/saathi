# BA — 05-expert-agents (the AI build)

## 1. Problem & context
Users shouldn't start from a blank slide/sheet/doc. They describe what they want; Saathi **builds a correct first draft** they then edit. Critically — and per our DNA — **the deterministic structure and the numbers come from our code; the LLM only narrates the prose.** A per-type expert (Slides/Sheets/Docs) reasons → acts on *our* tools → observes → validates → self-corrects. It runs **offline by default** (a deterministic template narrator) and uses **local Ollama** when available, behind one port.

## 2. Users & jobs-to-be-done
- Primary: anyone facing a blank document. Job: "When I describe what I need, I want a correct, editable draft — with real numbers, not made-up ones."

## 3. User stories
- **US-1**: As a user, I type a brief and click Build; an expert produces a valid, editable {deck/sheet/doc}.
- **US-2**: As a user, I see the agents work — reason → act → observe → validate — so I trust it.
- **US-3**: As a user, when I give numbers, the totals are **computed** (correct), never invented.
- **US-4**: As a user, it works with no internet/LLM (deterministic), and gets better prose when Ollama is running.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN a brief + type WHEN I build THEN the result passes that type's validator (slides have title+bullets; the sheet's total **evaluates to a number**; the doc has a heading + body) and loads into the editor, editable. *(→ TC-05.1.x, TC-05.3.1)*
- **AC-2** (US-3, DNA): GIVEN numbers in the brief THEN the deck/sheet total is the **engine-computed** value (uses the M2 formula engine), not the LLM's. *(→ TC-05.1.3)*
- **AC-3** (US-2): The build emits ordered **ReAct steps** (reason/act/observe/validate[/fix]) shown in the UI. *(→ TC-05.1.1, TC-05.2.1)*
- **AC-4** (self-correct): GIVEN an intermediate that fails a validator THEN a **fix** step repairs it and the build reports valid (bounded retries — never loops). *(→ TC-05.1.4)*
- **AC-5** (US-4): A real **Ollama LlmPort adapter** exists behind the port; if it's unavailable the build falls back to the deterministic template narrator. *(→ TC-05.1.5 backend, TC-05.2.1 fallback)*

## 5. Scope
- **In**: `LlmPort` + deterministic `TemplateLlm` + per-type experts + validators + the `runBuild` orchestrator (ReAct, self-correct, steps) in `@saathi/domain` (pure); an **Ollama adapter** (`@saathi/backend`) + `llm:narrate` IPC; an **AI-build panel** in Office (brief → step log → result loaded into the editor) in `@saathi/frontend`.
- **Out**: multi-turn chat refinement, tool use beyond the office engines, streaming token UI, RAG-grounded build (RAG is its own milestone). Cloud BYOK LLMs (later).

## 6. Success metrics / done-signal
Type a brief, click Build, watch the agent reason/act/observe/validate, and get a valid, editable draft — with computed (not invented) numbers — offline; Ollama improves the prose when present.

## 7. Open questions
- None. The frontend build uses Ollama-when-available with a deterministic fallback, so it is always correct and always works.
