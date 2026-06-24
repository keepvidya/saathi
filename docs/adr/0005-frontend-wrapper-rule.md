# ADR-0005 — Frontend Wrapper-Rule (vendor render libraries behind ports)

- **Status**: Accepted
- **Date**: 2026-06-24
- **Relates to**: ADR-0003/0004 (boundaries), the ENGINEERING-PROTOCOL Wrapper Rule

## Context
Until M8b every external vendor lived in `@saathi/backend/adapters` (ExcelJS, docx, pptxgenjs, pdf-lib, pdfjs-dist), wrapped behind a port and isolated by ESLint + dependency-cruiser. But some libraries **render in the browser** — they need the DOM or produce HTML for the renderer (KaTeX for math; later Shiki for code, Mermaid for diagrams, Pyodide for in-page execution). These cannot live in the backend; routing every formula through IPC would be absurd. They belong in `@saathi/frontend` — but the Wrapper Rule must still hold: the UI must not litter vendor imports across panes, and vendor types must not leak.

## Decision
Establish a **frontend Wrapper-Rule**: vendor render/execution libraries may be imported **only inside `packages/frontend/src/adapters/**`**, each behind a hand-written port (e.g. `MathRenderPort` ← `KatexMath`). Everywhere else in the frontend, importing such a vendor is a lint/boundary error.

Enforcement (mirrors the backend rule):
- **ESLint**: `frontend/src/**` forbids the vendor (`katex`); a later block for `frontend/src/adapters/**` resets it. Electron + backend stay forbidden everywhere in the frontend.
- **dependency-cruiser**: `vendor-only-in-adapter` now exempts `^packages/frontend/src/adapters/` (alongside `^packages/backend/src/adapters/`) and lists the frontend vendors; `domain-stays-pure` forbids them in the domain.
- Each adapter ships a **deterministic fallback** (e.g. `PlainMath`) so panes stay testable and degrade gracefully.

## Consequences
- One reusable convention for all client-side renderers: **KaTeX (M8b)**, then Shiki, Mermaid, Pyodide, Piper — each a new `frontend/src/adapters/<vendor>/` behind a port; no pane ever imports a vendor directly.
- Vendor CSS/fonts are imported inside the adapter, so they ship only when that adapter is bundled; KaTeX fonts required the CSP `font-src 'self'` addition.
- The hexagonal model is symmetric now: pure core in `@saathi/domain`, vendor wrappers in **either** `backend/adapters` (Node/file vendors) **or** `frontend/src/adapters` (render/exec vendors), UI depends only on ports.
