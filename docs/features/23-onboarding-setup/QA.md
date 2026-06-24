# QA — 23-onboarding-setup (M11d)

## 1. Risk assessment
| Risk | L | I | Test |
|---|---|---|---|
| Wrong mode recommended | M | M | hardware recommend (RAM threshold) |
| Setup not triggered / wrong model | M | M | onboarding integration (ollamaSetup arg) |
| Live install during dev/CI | M | H | mocked SetupControl; e2e uses Heavy path |
| Install/network in renderer | L | H | all in main; review |

## 2. Approach by level
- **Integration (frontend)**: onboarding shows the RAM + recommended mode; offline finish calls `ollamaSetup('shiva-chat:7b')`; Heavy shows a key step + `setSecret`.
- **E2E**: forced wizard → mode step shows the real RAM check → Heavy → Finish → shell (no live install). Screenshots of the mode step.
- **Review**: hardware/Ollama install + network only in `desktop/main/system-setup.ts`.

## 3. Exit criteria
All TCs pass; lint/typecheck/boundary green; 238 unit + 21 e2e green; visual review (mode step light + dark); screenshots committed.

## 4. Notes
The real silent Ollama install + Shiva pull are **not run in dev/CI** (heavy + machine-modifying); they run on the user's machine via the exe. Detection + flow + orchestration are mock-tested.
