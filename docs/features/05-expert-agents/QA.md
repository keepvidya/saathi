# QA — 05-expert-agents

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Build produces an invalid model | M | H | Validators + `runBuild.valid` per type |
| Numbers invented by the LLM | M | **H** (DNA) | Engine-computed total assertion |
| Self-correction loops forever | L | H | Bounded-retry unit test |
| Ollama failure blocks the build | M | M | Adapter error→[] + frontend fallback |
| AI build doesn't load into the editor | M | M | Frontend integration + e2e |

## 2. Test approach by level
- **Unit (domain)**: `runBuild` for slides/sheets/docs → valid model + ordered steps; `validateSheet` uses the engine; numbers computed; self-correct fixes an injected invalid; `TemplateLlm` deterministic; retry budget bounded.
- **Unit (backend)**: `OllamaLlm.narrate` with **mocked `fetch`** → lines; non-200/throw → `[]`.
- **Integration (frontend)**: AI-build panel runs `runBuild` (CompositeLlm → TemplateLlm fallback in jsdom), renders the step log, then loads the result into the editor (deck/sheet/doc visible).
- **E2E**: Office → type a brief → Build → step log appears → editor shows the built draft.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 valid + editable | TC-05.1.1/.2 | TC-05.2.1 | TC-05.3.1 |
| AC-2 computed numbers | TC-05.1.3 | — | — |
| AC-3 ReAct steps | TC-05.1.1 | TC-05.2.1 | TC-05.3.1 |
| AC-4 self-correct (bounded) | TC-05.1.4 | — | — |
| AC-5 Ollama behind port | TC-05.1.5 | (fallback) TC-05.2.1 | — |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M4 green.
- **Exit (Done)**: all TCs pass; domain coverage ≥90%; lint/typecheck/boundary green; code + **visual review** (build panel + step log + loaded draft, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] AI-build bar (brief + ✨ Build) in Office
- [ ] Step log shows reason/act/observe/validate (agent-labelled)
- [ ] On done, the editor shows the built draft (editable); numbers correct
- [ ] Brand tokens light + dark
- [ ] Screenshots (build step-log + result) committed

## 6. Test environment & data
Win11, Node 22, Electron 33 (Ollama NOT running in CI → deterministic fallback path exercised). Brief fixture: "Q3 results" with numbers [120,150,177].
