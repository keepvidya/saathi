# QA — 14-learn-run

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Wrong/empty output | M | **H** (trust) | Pyodide adapter unit (stdout capture) |
| Python error crashes the app | M | **H** | adapter catch → `{ok:false}`; pane error state |
| Code leaves the machine | L | **H** (DNA) | runs in main, no network; bridge fallback |
| Pyodide leaks into the renderer / CSP | L | M | runs in backend (main); Wrapper Rule (CI) |
| Cold-load hangs the UI | M | M | async + "Running…" state |

## 2. Test approach by level
- **Unit (backend)**: `PyodideRun.run('print(...)')` → `{ok:true}` with the printed text; a Python error → `{ok:false}` with the error message; empty code → `{ok:true, output:''}`.
- **Unit (frontend bridge)**: `runPython` uses `window.saathi.py.run` when present; returns the "needs the app" result with no host.
- **Integration (frontend)**: a runnable code block shows Run + output area; clicking (injected runner) shows the output; an error result shows the error styling; non-runnable code has no Run button.
- **E2E**: open Learn → click Run on the Python snippet → real output appears.
- **Boundary (CI)**: ESLint + dependency-cruiser fail if `pyodide` is imported outside `backend/adapters`.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 Run UI | — | TC-14.2.1 | TC-14.3.1 |
| AC-2 execute/output | TC-14.1.1, TC-14.1.2 | TC-14.2.2 | TC-14.3.1 |
| AC-3 local/fallback | bridge unit | TC-14.2.3 | — |
| AC-4 boundary | — | — | CI boundary |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M8d green.
- **Exit (Done)**: all TCs pass; backend/bridge coverage ≥90% (global gate); lint/typecheck/**boundary** green; code + **visual review** (Run + output, success + error, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Run button on the runnable snippet; output panel
- [ ] Success output (stdout) and error output (distinct styling)
- [ ] Brand tokens light + dark
- [ ] Screenshots (learn-run light + dark) committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixtures: `sampleLesson()` (now with a runnable Python block); `print(...)` + a `1/0` error for the adapter unit; an injected stub runner for the pane.
