# Saathi — Build Plan (roadmap of vertical slices)

> Governed by [ENGINEERING-PROTOCOL.md](./ENGINEERING-PROTOCOL.md). One slice fully **Done** (docs + tests + visual review) before the next.
> Status: **APPROVED — owner sign-off 2026-06-23.** Executing **M0** (local). Order/scope change via ADR.

## Principles applied
- **Walking skeleton first**, then thin vertical slices; "join small to make large."
- Each milestone = a shippable increment with its own `docs/features/<NN-slice>/` (BA/DEV/QA/TEST-PLAN) and green CI.
- Download page + cross-OS installers come **last**, after the app is functionally complete.

## Milestone map

| # | Slice | Goal (Definition of Done applies to all) | Key engines/ports |
|---|---|---|---|
| **M0** | **Walking Skeleton** | Repo + tooling + secure Electron shell that **boots, routes panes, themes**, with CI green and the security baseline. No features yet. | Electron, Vite, Vitest, Playwright, ESLint, dependency-cruiser |
| **M1** | **Shell & Themes (port)** | Rail (collapsible), pane router, topbar, **10 themes + light/dark** ported 1:1 from the approved prototype; theme persistence; visual parity. | `theme/`, `shell/` |
| **M2** | **Office · Sheets (first real engine)** | Create/edit a spreadsheet: editable grid, **formula engine** (domain) + **Univer** edit adapter, **frozen header**, export `.xlsx` via ExcelJS. Full BA/DEV/QA + unit/integration/e2e. | `core/domain/sheet`, `EvaluateSheet` port, Univer + ExcelJS adapters |
| **M3** | **Office · Docs** | Word-style editor, export `.docx` (docx). | TipTap/Univer doc adapter, docx adapter |
| **M4** | **Office · Slides + per-type Expert Agents** | Slides editor + **ReAct expert agents** (Orchestrator + Slides/Sheets/Docs experts, peer feedback, self-correction); export `.pptx` (pptxgenjs); template library. | agent runtime, `LlmPort` (Ollama), pptxgenjs adapter |
| **M5** | **Office home flow + PDF** | Staged home (Create-new + Templates + Recent), PDF read (PDF.js) + export; the fused Keepvidya-Office layout. | PDF.js adapter |
| **M6** | **Chat + LLM runtime** | Local chat on Ollama (+ BYOK), markdown render, history. | `LlmPort`, provider adapters |
| **M7** | **Knowledge / RAG** | Ingest (PDF/docx/xlsx/OCR), embeddings, hybrid retrieval, cited answers via **DocNest+Knovex**; benchmark harness. | `RagPort`, `VectorStorePort` |
| **M8** | **Learn** | Domain-native lessons: KaTeX, Mermaid, Shiki, Pyodide, Piper TTS. | render adapters |
| **M9** | **Browser + Shields** | Multi-tab webview, **ad/tracker blocking** (@ghostery/adblocker-electron), SearXNG search, agent-drive (gated). | `AdBlockPort`, `SearchPort`, Playwright/Stagehand |
| **M10** | **Agent + Skills + Memory** | ReAct supervisor→workers (MCP tools), Hermes-style memory (SQLite-FTS5). | `ToolPort`, memory adapter |
| **M11** | **Packaging & Auto-update** | Signed Windows installer, `electron-updater` feed, entertaining installer (Flows/Knovex style). | electron-builder, `UpdatePort` |
| **M12** | **CI/CD → keepvidya.com download page** | Release pipeline + **download page integrated on keepvidya.com** (LAST). | GitHub Actions, site |

> Order is deliberate: **Office Sheets (M2) is the first real engine** because it is the most-iterated, highest-value surface and exercises the full hexagonal path (domain formula engine + two adapters + UI + the test pyramid). It is our reference implementation of the protocol.

## M0 — Walking Skeleton: task checklist (the slice we execute first, on approval)
- [ ] Repo scaffold: `package.json`, `electron.vite.config.ts`, `tsconfig.*`, ESLint+Prettier, dependency-cruiser boundary config. *(partially scaffolded; to be completed)*
- [ ] Secure Electron main + preload (`contextIsolation`, `sandbox`, typed `window.saathi` with one method: `app.getInfo`).
- [ ] Renderer boots, mounts the shell, **pane router** with stub panes, **theme system** wired (token CSS + `setSkin`).
- [ ] Tooling: Vitest (unit/integration), Playwright-Electron (e2e) with one smoke test ("app launches, shows rail").
- [ ] GitHub: repo, branch ruleset on `main`, CODEOWNERS, PR/issue templates, labeler, CI workflow (typecheck, lint, boundary, unit, integration, e2e, build) — all green.
- [ ] Docs: `docs/features/00-walking-skeleton/` (BA/DEV/QA/TEST-PLAN), README, ADR-0002 (stack), CHANGELOG.
- [ ] **Visual review**: app window matches the prototype shell in light + one dark theme.

## What "execute" looks like per slice
`PLAN brief → write BA/DEV/QA + TEST-PLAN → implement to green tests → code review → visual UI review → merge`. Nothing skipped.

## Open approvals needed from owner
1. Approve **ENGINEERING-PROTOCOL.md** and **ARCHITECTURE.md**.
2. Approve this milestone **order** (esp. Sheets-first at M2).
3. Confirm **repo name/visibility** (`keepvidya/saathi`, public) and that I may create it + push M0.
