# Saathi — Architecture

> How the system is shaped. Governed by [ENGINEERING-PROTOCOL.md](./ENGINEERING-PROTOCOL.md). Decisions are recorded as ADRs.
> Status: **APPROVED — owner sign-off 2026-06-23.**

## 1. One-paragraph overview
Saathi is a **local-first Electron desktop app**. A thin **renderer** (vanilla TS, no framework) hosts the Saathi shell (rail, panes, themes) ported from the approved prototype. All real work happens in a **framework-agnostic domain core** reached through **ports**; every external library and the OS/Electron boundary sit behind hand-written **adapters** (the Wrapper Rule). The LLM (Shiva, local via Ollama; BYOK cloud optional) only narrates — engines compute the truth.

## 2. Layers (dependency direction points inward)

```
┌──────────────────────────────────────────────────────────────┐
│  RENDERER (UI)  — shell, panes, widgets  (vanilla TS + CSS)    │  drives inbound ports
│      │  calls inbound ports only; no vendor/Electron imports   │
├──────┼───────────────────────────────────────────────────────┤
│  APPLICATION  — use-cases / orchestrators (inbound ports impl) │
│      │  pure; depends on domain + outbound ports (interfaces)  │
├──────┼───────────────────────────────────────────────────────┤
│  DOMAIN (core) — entities, value objects, services, policies  │  ZERO third-party imports
│         formula engine · deck model · doc model · RAG policy   │
├──────────────────────────────────────────────────────────────┤
│  PORTS (interfaces)  inbound: BuildDeck, EvaluateSheet …       │
│                      outbound: LlmPort, ExportPort, SearchPort,│
│                      VectorStorePort, AdBlockPort, UpdatePort  │
├──────────────────────────────────────────────────────────────┤
│  ADAPTERS (Wrapper Rule)  — the ONLY place vendor types live   │
│   univer/ exceljs/ docx/ pptxgenjs/ pdfjs/ ollama/ searxng/    │
│   ghostery-adblocker/ docnest-knovex/ electron-updater/ …      │
├──────────────────────────────────────────────────────────────┤
│  PLATFORM  — Electron main, preload (contextBridge), IPC       │
└──────────────────────────────────────────────────────────────┘
```

Rule of thumb: **an arrow may only point down/inward.** The domain never imports an adapter; it depends on a port interface, and the adapter is injected (Dependency Inversion).

## 3. Repo layout — workspaces (ADR-0003: backend ⟂ frontend, not a monolith)
```
packages/
  shared/               @saathi/shared — contracts (Result, IPC channel names, DTOs). No electron/DOM.
    src/  test/
  backend/              @saathi/backend — the Node "backend". Pure + reusable. No electron, no DOM.
    src/
      domain/           pure logic: sheet/, deck/, doc/, rag/, learn/
      application/      use-cases implementing inbound ports
      ports/            inbound + outbound interfaces (TS types only)
      adapters/         one folder per vendor (the wrappers): office/ llm/ search/ vector/ …
    test/
  frontend/             @saathi/frontend — the UI. Runs standalone in a browser too.
    index.html  vite.config.ts
    src/
      shell/            rail, panes router, topbar
      panes/            chat/ knowledge/ learn/ create/ office/ browser/ agent/ skills/ settings
      theme/            tokens + skins + setSkin
      bridge/           thin client over window.saathi  ← frontend's ONLY platform touchpoint
      ui/               shared widgets
    test/
  desktop/              @saathi/desktop — thin Electron host (composition root)
    electron.vite.config.ts
    src/
      main/             window, lifecycle, IPC handlers (wires @saathi/backend), updater
      preload/          contextBridge — typed, one method per channel
      renderer/         index.html + 3-line entry that mounts @saathi/frontend
    test/  (e2e)
docs/                   protocol, architecture, build-plan, adr/, features/
```
**Backend and frontend never import each other** — they meet only at the IPC contract in `@saathi/shared`, bridged by `@saathi/desktop`. Enforced by ESLint + dependency-cruiser in CI.

## 4. The Wrapper Rule by example
```ts
// core/ports/export.port.ts        (domain-facing interface — no vendor types)
export interface SpreadsheetExportPort {
  toXlsx(model: SheetModel): Promise<Bytes>;
}

// adapters/office/exceljs/exceljs-spreadsheet-export.adapter.ts   (ONLY file that knows ExcelJS)
import ExcelJS from 'exceljs';            // ← the single allowed import site
export class ExcelJsSpreadsheetExport implements SpreadsheetExportPort {
  async toXlsx(model: SheetModel): Promise<Bytes> { /* translate model → ExcelJS → bytes */ }
}
```
- Domain/use-cases import **only** `SpreadsheetExportPort`. Swapping ExcelJS for another writer touches **one** adapter file.
- CI import-boundary rule fails the build if `exceljs` (or any vendor) is imported outside `adapters/`.

## 5. Process & security model (Electron)
- **Main**: owns windows, filesystem, network egress, the updater, and all privileged operations. Validates every IPC arg.
- **Preload**: `contextBridge.exposeInMainWorld('saathi', …)` — a **typed, minimal** surface, **one function per IPC channel**, args validated. Never exposes `ipcRenderer` raw.
- **Renderer**: sandboxed, `contextIsolation` on, no Node. Talks to the world **only** through `window.saathi` (wrapped again in `renderer/src/bridge/`).
- Strict CSP; external links → OS browser; BYOK keys in OS keychain.

## 6. Expert-Agent runtime (per file type) {#expert-agents}
The Office "AI build" is a **ReAct multi-agent** system. The LLM proposes; **our tools decide and build.**

```
              ┌─────────────┐
   user brief │ Orchestrator│  plans, routes, enforces budget, merges feedback
   + answers  └─────┬───────┘
                    │ assigns by type
   ┌────────────────┼─────────────────┐
   ▼                ▼                  ▼
 SlidesExpert    SheetsExpert       DocsExpert      (one expert per type; PDF reuses Docs/Slides)
   │ ReAct loop: reason → ACT(call deterministic tool) → observe → critique → self-correct
   │ tools: OutlinePort, WritePort(Shiva), ChartBuilder, FormulaEngine, Validator, ExportPort
   └─ peer feedback: e.g. SheetsExpert returns the numbers SlidesExpert must cite (no invented figures)
```
- **Reason/act/observe**: each expert calls **our** tools (deterministic). The model never returns the file — it returns structured content the engine renders.
- **Inter-agent feedback**: experts exchange artifacts (e.g. the deck cites the sheet's real totals). Contracts are typed ports.
- **Self-correction**: each expert runs **validators** (schema, formula re-eval, link/citation check, layout-fit) and loops until green or budget hit; failures are surfaced, never hidden.
- **Determinism guarantee**: the `.pptx/.xlsx/.docx` bytes come from ExcelJS/docx/pptxgenjs/Univer adapters — correctness is the engine's, phrasing is Shiva's.
- **Templates**: a versioned template library (ported from the prototype's styles). New templates may be **authored at dev-time with Claude** and checked in as data; runtime stays local/Shiva.

## 7. Engine choices (from the approved specs)
Office edit → **Univer** (Apache-2.0); export → **ExcelJS / docx / pptxgenjs**; PDF read → **PDF.js** (+ Tesseract.js OCR); RAG → **DocNest + Knovex** (ours) behind `VectorStorePort`/`RagPort`; search → **SearXNG**; browser ad-block → **@ghostery/adblocker-electron**; Learn → **KaTeX / Mermaid / Shiki / Pyodide / Piper**; updates → **electron-updater**. Each sits behind an adapter. See [OFFICE-ENGINE-SPEC](../../keepvidya-workspace/OFFICE-ENGINE-SPEC.md) and [OPEN-SOURCE-STACK](../../keepvidya-workspace/OPEN-SOURCE-STACK.md).
