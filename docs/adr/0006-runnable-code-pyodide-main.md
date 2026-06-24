# ADR-0006 — Runnable code via Pyodide in the main process

- **Status**: Accepted
- **Date**: 2026-06-24
- **Relates to**: ADR-0003/0004 (boundaries), ADR-0005 (frontend Wrapper-Rule), the ENGINEERING-PROTOCOL Wrapper Rule + Electron security baseline

## Context
Learn wants **runnable** Python snippets — execute locally, show real output, offline. The obvious place is the renderer (Pyodide WASM in the page). But Pyodide in the renderer requires loosening the Content-Security-Policy to allow `wasm-unsafe-eval` (and historically `unsafe-eval`), which materially weakens the security baseline of a privacy-first app — and it bundles ~15 MB of WASM/stdlib into the renderer plus a worker. The other client-side renderers (KaTeX/Shiki/Mermaid, ADR-0005) are pure text/markup transforms; a CPython runtime is a different class of dependency.

## Decision
Run Python in the **main process** via **Pyodide (Node)**, wrapped behind a `PyRunPort` in `@saathi/backend` (the same backend Wrapper Rule as the pdf.js adapter), reached over a `py:run` IPC channel and `bridge.runPython`. The renderer only sends code and renders the returned `{ ok, output }`.

Consequences of running in main, not the renderer:
- **No renderer CSP change** — the security baseline (`script-src 'self'`, no `unsafe-eval`) is preserved. WASM execution stays in the Node main process.
- **Hexagonal fit** — Pyodide is just another backend vendor behind a port + IPC, consistent with ExcelJS/docx/pdf-lib/pdfjs. The renderer has no new vendor.
- **Lazy + offline** — the runtime loads once on first Run, from bundled `node_modules/pyodide` assets (no network).

## Consequences / follow-ups
- The main process holds the Python runtime after first use (~100 MB). Acceptable for an occasional feature; a **utility-process/worker isolation** is a future hardening (so long-running user code can't block the UI thread and can be cancelled).
- **Packaging (M11)**: the Pyodide WASM/stdlib assets in `node_modules/pyodide` must be `asar`-unpacked so `loadPyodide` can read them in a packaged build.
- Scope for now is the **stdlib** only (no pip/network). Real program output upholds the narrator principle: correctness comes from CPython, never a model.
