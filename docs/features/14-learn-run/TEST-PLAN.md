# TEST PLAN — 14-learn-run

- **Plan id**: TP-14
- **Items under test**: `@saathi/domain/learn` (`runnable` flag), `@saathi/backend` Pyodide adapter (`PyodideRun`), `py:run` IPC + `bridge.runPython`, Learn pane Run UI.
- **Approach**: unit (backend + bridge) + integration (pane) + e2e + CI boundary.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-14.1 — Pyodide adapter (UNIT · backend)

### TC-14.1.1 — runs Python, captures stdout
| # | Action | Expected |
|---|---|---|
| 1 | `PyodideRun.run('print("hi"); print(2**10)')` | `{ ok:true, output }` where output contains `hi` and `1024` |

### TC-14.1.2 — Python error is reported, not thrown
| # | Action | Expected |
|---|---|---|
| 1 | `run('1/0')` | `{ ok:false, output }` containing `ZeroDivisionError` |
| 2 | `run('')` | `{ ok:true, output:'' }` |

---
## Suite TS-14.2 — Learn pane Run (INTEGRATION · frontend)

### TC-14.2.1 — runnable code shows Run + output area
| # | Action | Expected |
|---|---|---|
| 1 | render a lesson with a `runnable` code block | a `.lsn-run` button + `.lsn-run-out` exist |
| 2 | a non-runnable code block | no Run button |

### TC-14.2.2 — clicking Run shows the output (injected runner)
| # | Action | Expected |
|---|---|---|
| 1 | inject `run` resolving `{ ok:true, output:'42' }`; click Run | the output panel shows `42`; runner called with the source |
| 2 | inject `run` resolving `{ ok:false, output:'Boom' }`; click Run | the panel shows `Boom` with the error styling (`.lsn-run-out.err`) |

### TC-14.2.3 — bridge fallback with no host
| # | Action | Expected |
|---|---|---|
| 1 | `bridge.runPython('x')` with no `window.saathi` | `{ ok:false, output }` mentioning the desktop app |
| 2 | with `window.saathi.py.run` present | delegates to the host |

---
## Suite TS-14.3 — Flow (E2E · Playwright-Electron)

### TC-14.3.1 — Learn: run a Python snippet
| # | Action | Expected |
|---|---|---|
| 1 | launch → Learn; click Run on the Python snippet | the output panel shows the snippet's real output (light + dark screenshots) |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-14.2.1, TC-14.3.1 |
| AC-2 | TC-14.1.1, TC-14.1.2, TC-14.2.2, TC-14.3.1 |
| AC-3 | TC-14.2.3, bridge unit |
| AC-4 | CI boundary (ESLint + dependency-cruiser) |
