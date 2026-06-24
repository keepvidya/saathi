# TEST PLAN — 21-onboarding (M11b)

- **Plan id**: TP-21
- **Items under test**: `renderOnboarding`, `startApp`, `app:firstRun` IPC + `bridge.firstRun`.
- **Approach**: integration (wizard) + e2e + main contract.

## Suite TS-21.2 — wizard (INTEGRATION · injected settings)
### TC-21.2.1 — walk + finish
| # | Action | Expected |
|---|---|---|
| 1 | name → Next → Next → Next → Finish | `settings.set({ userName, llmMode:'offline', onboarded:true })`; `onDone` called |
### TC-21.2.2 — cloud key
| # | Action | Expected |
|---|---|---|
| 1 | choose cloud; enter key; finish | key field shown; `setSecret(SECRET_LLM, key)`; `onboarded:true` |
### TC-21.2.3 — back
| # | Action | Expected |
|---|---|---|
| 1 | Next then Back | returns to the name step |

## Suite TS-21.3 — Flow (E2E)
### TC-21.3.1 — forced wizard → app
| # | Action | Expected |
|---|---|---|
| 1 | launch `--force-onboarding`; step through; Finish | the wizard shows then the shell (`.rail`) mounts (light + dark screenshots) |

## Traceability
| AC | Covered by |
|---|---|
| AC-1/2 | TC-21.2.1, TC-21.2.2, TC-21.3.1 |
| AC-3 | TC-21.2.1, TC-21.3.1 |
| AC-4 | main firstRun + e2e |
