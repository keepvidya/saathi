# TEST PLAN — 23-onboarding-setup (M11d)

- **Plan id**: TP-23
- **Items**: `system-setup.ts` (hardware/Ollama), `system:*`/`ollama:*` IPC + `bridge.setupControl`, the redesigned onboarding.

## TS-23.2 — onboarding (INTEGRATION · injected settings + setup)
### TC-23.2.1 — hardware check + recommendation
| # | Action | Expected |
|---|---|---|
| 1 | render; Continue → mode step | shows "16 GB RAM"; Lite marked Recommended |
### TC-23.2.2 — offline pulls Shiva
| # | Action | Expected |
|---|---|---|
| 1 | name → Lite → embedding → Set it up | `ollamaSetup('shiva-chat:7b')` called |
| 2 | Enter Saathi | settings `{runMode:'lite', llmMode:'offline', onboarded:true}`; `onDone` |
### TC-23.2.3 — heavy key
| # | Action | Expected |
|---|---|---|
| 1 | Heavy → embedding → key step → enter key → Finish | settings `{runMode:'heavy', llmMode:'cloud'}`; `setSecret(SECRET_LLM, key)` |

## TS-23.3 — E2E
### TC-23.3.1 — forced wizard → app
| # | Action | Expected |
|---|---|---|
| 1 | `--force-onboarding`; name; mode step | real RAM check shown (light + dark screenshots); Heavy → Finish → `.rail` |

## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-23.2.1, TC-23.3.1 |
| AC-2 | TC-23.2.2 |
| AC-3 | TC-23.2.3 |
| AC-4 | review |
