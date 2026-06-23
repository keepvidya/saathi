# DEV — 05-expert-agents

## 1. Approach
Put the **agent system in `@saathi/domain` (pure)**: an `LlmPort` (the only LLM seam), a deterministic `TemplateLlm`, per-type **experts** (Slides/Sheets/Docs), **validators**, and the `runBuild` **orchestrator** that runs a ReAct loop (reason→act→observe→validate→fix) emitting `BuildStep`s and producing a domain model (`DeckData`/`SheetData`/`DocData`). Numbers are computed with the **M2 formula engine** (cross-engine), never by the LLM. `@saathi/backend` adds an **Ollama adapter** (plain `fetch`, behind `LlmPort`) + `llm:narrate` IPC. `@saathi/frontend` adds an **AI-build panel** and a `CompositeLlm` = try Ollama (IPC) → fall back to `TemplateLlm`. Editors gain an optional initial-model param so a build can load straight in.

## 2. Ports touched
- **`LlmPort`** (domain): `narrate(p: NarratePrompt): Promise<string[]>` — implemented by `TemplateLlm` (domain), `OllamaLlm` (backend), `IpcLlm`/`CompositeLlm` (frontend).
- **IPC**: `llm:narrate` (renderer → main → backend Ollama; returns `[]` on failure).

## 3. Domain model
- `runBuild(brief: BuildBrief, llm: LlmPort, onStep?)` → `BuildResult { type, deck?/sheet?/doc?, steps, valid }`.
- `BuildStep { agent, phase: 'reason'|'act'|'observe'|'validate'|'fix'|'done', text }`.
- Validators: `validateDeck/validateSheet/validateDoc` → `string | null` (the failure, or null). `validateSheet` evaluates the total cell via the `Sheet` engine.

## 4. Data structures & complexity (DSA)
| Operation | Time | Space | Notes |
|---|---|---|---|
| Build (per type) | O(n) slides/cells/blocks | O(n) | one pass + ≤K fix attempts |
| Self-correct | O(K·validate), K≤2 (budget cap) | O(1) | **bounded** — cannot loop |
| Real total | O(m) numbers via `=SUM` engine | O(m) | computed, deterministic |

## 5. Design patterns
- **Strategy** (expert per type), **Template Method** (the ReAct loop), **Observer** (`onStep`), **Dependency Inversion** (`LlmPort` injected), **Adapter** (Ollama), **Composite/Chain** (`CompositeLlm` Ollama→Template fallback).

## 6. External modules (Wrapper Rule)
| Vendor | Wrapped by | Port | Notes |
|---|---|---|---|
| **Ollama** (HTTP) | `backend/adapters/ollama/ollama-llm.adapter.ts` via `fetch` | `LlmPort` | no npm dep (built-in fetch); IO isolated in the adapter |

## 7. Flow / sequence
Office AI-build: brief + type → `runBuild(brief, CompositeLlm, onStep)` → step log renders live → on done, `EDITORS[type](body, result.model)` loads the draft. `CompositeLlm.narrate` → `bridge.narrate` (IPC → main → `OllamaLlm`); empty/throws → `TemplateLlm`.

## 8. Error handling
LLM failure → `[]` → deterministic fallback (never blocks the build). Validators return failures as values; the orchestrator fixes within a **bounded** retry budget, then reports `valid:false` honestly if it still can't (it always can for the template path). IPC args validated.

## 9. Risks & mitigations
- **Invented numbers** → numbers come from the `Sheet` engine; `TC-05.1.3` asserts the computed total.
- **Infinite self-correction** → hard retry cap (K≤2); `TC-05.1.4`.
- **Invalid output** → validator gate; build reports `valid`.
- **Ollama down** → graceful fallback; `TC-05.1.5` + frontend fallback test.

## 10. ADRs
- Reuses ADR-0004 (`@saathi/domain`). No new ADR.
