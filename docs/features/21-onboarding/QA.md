# QA — 21-onboarding (M11b)

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Wizard blocks dev/e2e | M | **H** | first-run packaged-only (main); e2e unaffected |
| Choices not saved | M | M | finish → settings.set onboarded + fields |
| Key not encrypted | L | **H** | key routed via M11a secrets |
| Can't go back | L | M | Back step unit |

## 2. Test approach by level
- **Integration (frontend)**: step through name→offline→none→finish → `settings.set({...,onboarded:true})` + `onDone`; cloud path reveals the key field + `setSecret`; Back returns a step.
- **E2E**: launch with `--force-onboarding` → wizard → step through → Finish → the shell mounts; (light + dark screenshots of the wizard).
- **Main**: `app:firstRun` true only when packaged-and-not-onboarded, or forced.

## 3. Coverage matrix
| AC | Integration | E2E |
|---|---|---|
| AC-1/2 collect+key | TC-21.2.1/2 | TC-21.3.1 |
| AC-3 finish→mount | TC-21.2.1 | TC-21.3.1 |
| AC-4 packaged-only | — | e2e (forced) + main |

## 4. Entry / exit criteria
- **Entry**: M11a green.
- **Exit**: all TCs pass; lint/typecheck/boundary green; visual review (wizard light + dark); screenshots committed; all 20 existing e2e still green (shell, not wizard).

## 5. Visual review checklist
- [ ] Branded wizard card; steps (name / AI / search / done); progress dots; Back/Next/Finish
- [ ] Light + dark; screenshots committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixtures: injected settings stub; `--force-onboarding`.
