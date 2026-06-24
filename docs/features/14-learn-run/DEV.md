# DEV — 14-learn-run

## 1. Approach
Mark a `code` block `runnable` (Python). Execution runs in the **main process** via **Pyodide (Node)** behind a `PyRunPort` in `@saathi/backend` (the backend Wrapper Rule, like the pdf.js adapter), reached over a `py:run` IPC channel + `bridge.runPython`. Pyodide is a lazy singleton; we capture stdout+stderr and return `{ ok, output }`. The renderer never touches WASM, so there is **no CSP change** and no `unsafe-eval`. The Learn pane adds a Run button + output panel to runnable code blocks; the code stays Shiki-highlighted. With no host (standalone/tests), `bridge.runPython` returns a friendly "needs the desktop app" result.

## 2. Ports touched
- **Outbound (backend)**: `PyRunPort { run(code: string): Promise<PyRunResult> }`, `PyRunResult { ok: boolean; output: string }` — impl `PyodideRun` (lazy `loadPyodide`, `setStdout/Stderr` capture, `runPythonAsync`).
- **IPC**: `py:run` (renderer → main): payload = code string; returns `PyRunResult`.

## 3. Domain model
- `CodeBlock` gains `runnable?: boolean` (additive). `sampleLesson` gains a runnable Python snippet. No logic in the domain — running is a backend capability.

## 4. Data structures & complexity (DSA)
| Operation | Time | Notes |
|---|---|---|
| First run (cold) | ~2–4 s | one-time Pyodide load (lazy singleton) |
| Subsequent runs | O(program) | reuse the loaded runtime |

## 5. Design patterns
- **Adapter** (Pyodide behind `PyRunPort`), **Lazy singleton** (one runtime), **Facade** (`bridge.runPython`), **Dependency Inversion** (pane → injected runner → bridge → IPC → adapter), **narrator** (real output, no model).

## 6. External modules (Wrapper Rule)
| Vendor | Wrapped by | Port | Notes |
|---|---|---|---|
| **pyodide** (Node) | `backend/adapters/pyodide/py-run.adapter.ts` | `PyRunPort` | the only file importing pyodide; ESLint + dep-cruiser `vendor-only-in-adapter`/`domain-stays-pure` extended with `pyodide`; runs in **main**, not the renderer |

## 7. Flow / sequence
Run click → `bridge.runPython(source)` → `py:run` IPC → main → `PyodideRun.run` (load once, capture stdout/stderr, `runPythonAsync`) → `{ ok, output }` → pane renders the output panel (ok vs error styling).

## 8. Error handling
Python exception → caught → `{ ok:false, output: <error text> }` (no crash). Empty code → `{ ok:true, output:'' }`. IPC validates the payload is a string. No host → `bridge` returns `{ ok:false, output:'Running code needs the Saathi desktop app.' }`.

## 9. Risks & mitigations
- **WASM/CSP in the renderer** → avoided entirely by running Pyodide in the **main process** (ADR-0006).
- **Cold-load latency** → lazy singleton; the button shows a "Running…" state; subsequent runs are fast.
- **Untrusted code blocking main** → lesson snippets are authored content; a worker/utility-process isolation is a tracked hardening (M11). Pyodide is sandboxed (no host FS/network by default).
- **Packaging the WASM assets** → node_modules/pyodide must be asar-unpacked when packaged (M11).
- **Vendor leak** → Wrapper Rule fails CI if `pyodide` is imported outside the adapter.

## 10. ADRs
**ADR-0006 — Runnable code via Pyodide in the main process** (not the renderer): rationale = no renderer CSP relaxation, hexagonal backend adapter, deterministic real output.
