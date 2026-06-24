# BA — 14-learn-run (Learn: runnable code · Pyodide)

## 1. Problem & context
The best way to learn code is to **run it**. This slice makes Python lesson snippets **runnable** — the learner clicks Run and sees real output, computed by a real CPython (Pyodide), entirely **on their machine, offline**. This is the narrator principle at full strength: the output is *real program output*, not a model's guess. Architecturally, Python runs in the **main process** (behind a backend adapter + IPC), so the renderer needs **no WASM and no CSP relaxation**.

## 2. Users & jobs-to-be-done
- Primary: a learner studying code. Job: "When a lesson shows a Python snippet, I want to run it and see the actual output, so I learn by doing — without installing Python."

## 3. User stories
- **US-1**: As a learner, a **runnable** Python snippet shows a **Run** button.
- **US-2**: As a learner, clicking Run executes the code locally and shows its **output** (or the error), offline.
- **US-3**: As a learner, running never sends my code anywhere — it executes on my machine.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN a `code` block marked `runnable` THEN a Run button + an output area are shown. *(→ TC-14.2.1)*
- **AC-2** (US-2): GIVEN Run is clicked THEN the code is executed (Pyodide, main process) and its **stdout** is shown; a Python error shows the error message, not a crash. *(→ TC-14.1.1, TC-14.1.2, TC-14.2.2, TC-14.3.1)*
- **AC-3** (US-3): Execution is **local** (main process, no network); with no desktop host (standalone/tests) Run reports that it needs the app. *(→ TC-14.2.3, bridge unit)*
- **AC-4** (architecture): Pyodide is imported **only** inside `backend/adapters` behind a `PyRunPort` (Wrapper Rule); the renderer has no WASM and no CSP change. *(→ CI boundary)*

## 5. Scope
- **In**: a `runnable` flag on the `code` block (`@saathi/domain`, additive); a `PyRunPort` + **Pyodide adapter** (`@saathi/backend`, Node, lazy singleton) + `py:run` IPC + `bridge.runPython`; the Learn pane Run button + output panel.
- **Out** (later): pip packages / imports beyond the stdlib, stdin, long-run cancellation, a worker/utility-process isolation (a future hardening), languages other than Python, Piper TTS.

## 6. Success metrics / done-signal
Open Learn, click Run on a Python snippet, see its real output (and a clean error for bad code) — offline, with no renderer CSP change and Pyodide wrapped behind the port.

## 7. Open questions / decisions for owner
- Pyodide runs in the **main process** for now (simple, no renderer security tradeoff). A utility-process/worker isolation + packaging (asar-unpack of the WASM assets) are tracked for M11. Recorded in ADR-0006.
