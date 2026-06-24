# Changelog

All notable changes to Saathi are documented here. Format: [Keep a Changelog](https://keepachangelog.com); versioning: [SemVer](https://semver.org).

## [Unreleased]

### Added — M8d Learn · Diagrams (Mermaid)
- **Mermaid diagrams** in lessons: a `diagram` block (`@saathi/domain`, additive) rendered by **Mermaid** behind a `DiagramRenderPort` (`MermaidDiagram`, lazy dynamic-import, `securityLevel:'strict'`; deterministic `PlainDiagram` fallback) — the third adapter under the frontend Wrapper-Rule (ADR-0005). Progressive enhancement: the definition shows immediately, then the SVG swaps in.
- **Theme-reactive**: Mermaid bakes colours into the SVG, so the pane installs a `MutationObserver` on `<html data-theme>` and **re-renders** diagrams in the matching Mermaid theme (light→`neutral`, dark→`dark`) on a theme switch; the observer self-disconnects once the pane leaves the DOM. Invalid diagrams degrade to their source (no crash).
- Tests: Mermaid adapter units (escape fallback, never-throws), Learn-pane integration (source→SVG swap, theme re-render, injected fallback), e2e (SVG renders + re-renders on switch). 160 unit/int + 13 e2e green; coverage met. Screenshots: learn-diagram light + dark.
- **Still deferred → later slices:** Pyodide (runnable Python), Piper TTS.

### Added — M8c Learn · Code highlighting (Shiki)
- **Syntax-highlighted lesson code** via **Shiki** behind a `CodeHighlightPort` (`ShikiHighlight`, with a deterministic `PlainHighlight` fallback) — the second adapter under the frontend Wrapper-Rule (ADR-0005), and the first **async** one. Code shows as plain text immediately and is **progressively** replaced by highlighted markup; dual-theme output (`--shiki-light`/`--shiki-dark` CSS vars) follows `data-theme` with **no re-render**. Unknown languages / failures degrade to plain code.
- **No WASM, no CSP change**: uses Shiki's **JavaScript RegExp engine** and the fine-grained **`shiki/core`** API with explicit theme/lang imports (js/ts/python/json/bash/html/css) — keeping the renderer assets at ~2.7 MB instead of ~12 MB (the convenience `shiki` entry code-splits the entire grammar registry).
- Tests: Shiki adapter units (dual-theme markup, unknown-lang no-throw, `PlainHighlight` escape), Learn-pane integration (plain-first then swap; injected fallback), e2e (highlighted tokens visible, light + dark). 153 unit/int + 12 e2e green; coverage met. Screenshots: learn-code light + dark.
- **Still deferred → later slices:** Mermaid (diagrams), Pyodide (runnable Python), Piper TTS.

### Added — M8b Learn · Math (KaTeX) + the frontend Wrapper-Rule
- **Math in lessons**: a `math` block in the Lesson model (`@saathi/domain`, additive) rendered by **KaTeX** behind a `MathRenderPort` (`KatexMath`, with a deterministic `PlainMath` fallback). Inline + display modes; malformed TeX degrades to readable text (`throwOnError:false`); `lessonPlainText` skips math (not narration).
- **Frontend Wrapper-Rule established (ADR-0005)**: vendor *render* libraries may be imported **only** inside `packages/frontend/src/adapters/**`, behind a port — enforced by ESLint (anchored `^katex(/|$)` so it can't catch our own folder) + dependency-cruiser (`vendor-only-in-adapter` now exempts `frontend/src/adapters`, `domain-stays-pure` forbids katex). KaTeX's CSS is imported inside its adapter, so it ships only when bundled. CSP gains **`font-src 'self'`** so KaTeX's woff2 fonts load when packaged.
- Tests: KaTeX adapter units (display/inline render, malformed no-throw, `PlainMath` escape), domain math-block units, Learn-pane math integration (KaTeX + injected fallback), e2e (typeset formula visible). 148 unit/int + 11 e2e green; coverage met (math.adapter.ts 100%). Screenshots: learn-math light + dark.
- **Still deferred → later slices:** Shiki (code highlighting), Mermaid (diagrams), Pyodide (runnable Python), Piper TTS — each a wrapped frontend adapter using the convention this slice establishes.

### Added — M8 Learn (lessons + quiz engine + read-aloud)
- **Pure Lesson model + deterministic quiz engine** (`@saathi/domain/learn`): a `Lesson` of typed blocks (`prose` / `code` / `quiz`); `gradeQuiz` (correct ⇔ `chosen === answer`) and `scoreLesson` (correct / total / answered) — **correctness is decided by our code, never a model** (DNA); `lessonPlainText` (narration for read-aloud / search) + `sampleLesson`.
- **Learn pane** (`@saathi/frontend`): renders a lesson (prose via the XSS-safe `markdownToHtml`, code blocks, interactive quizzes), grades each answer with the engine, reveals the correct option + explanation, locks after answering, and shows a running **score**. **Read-aloud** via a wrapped **Web Speech** adapter (`SpeechPort`; `WebSpeech` + `SilentSpeech` fallback) — built-in browser API, no new dependency, no CSP change. Brand-locked light + dark (status green/red from the locked theme tokens).
- Tests: domain quiz-engine units (grade, score partial/none, plain-text), speech-adapter units (mocked `speechSynthesis` + silent fallback), Learn-pane integration (render, correct/incorrect, lock, score, read-aloud), e2e (render → answer → correct + score). 140 unit/int + 10 e2e green; coverage met (learn.ts 100%). Screenshots: learn light + dark.
- **Deferred to M8b "Learn — rich rendering":** math (KaTeX), diagrams (Mermaid), syntax highlighting (Shiki), runnable Python (Pyodide), Piper TTS — each a wrapped render/exec adapter (+ a CSP `font-src 'self'` change for KaTeX fonts).

### Added — M7 Knowledge / RAG
- **Pure RAG engine** (`@saathi/domain`): `chunkText` (paragraph/size chunking) → a `Corpus` repository → a lexical **`retrieve`** (TF-IDF: term-frequency × smoothed inverse-doc-frequency, top-k) → an **extractive, cited `composeAnswer`** → `{ answer, citations }`. Per our DNA the grounding path has **no LLM** — the answer is verbatim document text with a `[n]` citation back to its source; nothing is invented.
- **PDF text extraction** (`@saathi/backend`) behind a new `PdfReadPort`, wrapping **pdf.js (`pdfjs-dist`, legacy Node build)** — the only file importing it (Wrapper Rule, extended in ESLint + dependency-cruiser). Loaded via dynamic `import()` so the ESM library runs from the CJS main bundle. `pdf:extractText` IPC (validated) → renderer `bridge.extractPdfText`. *(pdf-parse was tried first but its bundled, ancient pdf.js fails on Node 22.)*
- **Knowledge pane** (`@saathi/frontend`): add a document (paste text **or upload a PDF**), a document list, ask a question → a grounded answer (markdown) + **citation chips** that name the source document and quote the passage. Brand-locked light + dark.
- Tests: domain RAG units (chunking, TF-IDF ranking + k, extractive-grounded cited answer, empty cases), pdf.js round-trip integration, Knowledge-pane integration (ingest → ask → citation), e2e (add → ask → cited answer). 124 unit/integration + 9 e2e, gated coverage met. Screenshots: knowledge light + dark.

### Added — M6 Chat
- **Local AI chat** (the default pane): a pure `ChatPort` + deterministic `EchoChat` + `Conversation` model and a minimal **XSS-safe markdown→HTML** renderer (`@saathi/domain`); an **Ollama chat adapter** (`@saathi/backend`, `/api/chat`, `''` on failure) + `chat:reply` IPC; the Chat pane (message list, composer, markdown replies, `CompositeChat` = Ollama→Echo fallback) in `@saathi/frontend`.
- Works **offline** (deterministic reply) and uses **Ollama** when running; conversation persists in-session; replies render markdown (bold/italic/code/lists/links) safely (escape-first, link-sanitised).
- Tests: markdown renderer + Conversation + EchoChat units, OllamaChat (mocked fetch), CompositeChat fallback, Chat-pane integration, e2e send→reply. 107 tests total, gated coverage met. Screenshots: chat light + dark.

### Added — M5b PDF export
- **pdf-lib export adapter** (`@saathi/backend`) behind `PdfExportPort` — renders `DocData` to a paginated, word-wrapped A4 PDF (Helvetica/-Bold, brand ink), with text sanitised to the font encoding. The only file importing `pdf-lib` (Wrapper Rule). Integration test reloads the output with pdf-lib and asserts a valid, multi-page PDF.
- **Download PDF** button on the Docs editor → `doc:exportPdf` IPC → host Save. Completes the Office export set: **.xlsx / .docx / .pptx / .pdf**.
- Tests: pdf round-trip + pagination integration, Docs-editor PDF-button + bridge integration, e2e control present. 90 tests total, gated coverage met.

### Added — M5 Office home (staged launchpad)
- A staged **Office home** (the Keepvidya-Office layout, on the locked brand palette): hero + local badge + **Create new** cards (Spreadsheet/Document/Presentation) + **Templates** (Monthly budget, Business letter, Pitch deck, Invoice) + **Recent** (in-session). Picking any opens the matching editor.
- `renderOffice` is now a small state machine (`home` ↔ `editor`); the editor view gained a **← Office** back control. The Sheets/Docs/Slides switcher, AI build, and exports (M2–M4b) are reused unchanged.
- Tests: home routing integration (create/template/recent → editor, back, switcher+AI-build intact) + e2e (home → editor → back). 86 tests total, gated coverage met. Screenshots: home light + dark.

### Added — M4b Expert Agents (the AI build)
- **Per-type expert agents** (`@saathi/domain`): an `LlmPort` (the only LLM seam) + a deterministic `TemplateLlm`, per-type experts (Slides/Sheets/Docs), validators, and the `runBuild` ReAct orchestrator (reason→act→observe→validate→fix) that emits `BuildStep`s and produces a `DeckData`/`SheetData`/`DocData`. **Numbers are computed by the M2 formula engine, never invented** by the LLM; self-correction is bounded (no loops).
- **Ollama adapter** (`@saathi/backend`) behind `LlmPort` (built-in `fetch`; `[]` on failure) + `llm:narrate` IPC. Frontend `CompositeLlm` tries Ollama, falls back to the deterministic narrator — so the build is always correct and works offline.
- **AI-build bar** in Office: type a brief → a live **ReAct step log** (agent-labelled) → the built draft **loads into the editor**, editable, on-brand. Editors now accept an optional initial model.
- Tests: agent unit (valid builds, computed numbers, bounded self-correct), validators unit, Ollama adapter (mocked fetch), CompositeLlm fallback, AI-build integration, e2e. 84 tests total, gated coverage met. Screenshots: build log + loaded result.

### Added — M4 Office · Slides
- **Pure DeckData model** (`@saathi/domain`): deck title + slides of `{title, bullets[]}`; `deckPlainText` + `sampleDeck` (3-slide investor deck).
- **pptxgenjs export adapter** (`@saathi/backend`) behind `DeckExportPort` — a real `.pptx`, one slide each with a title + bullet list (Wrapper Rule: the only file importing `pptxgenjs`; integration test unzips the file and asserts `ppt/slides/slide1.xml` carries the title + a bullet).
- **Slides editor** (`@saathi/frontend`): a 16:9 editable slide canvas (title + bullets) + a slide strip (thumbnails, switch, "＋ add"), brand light/dark. The Office switcher is now **Sheets / Docs / Slides**.
- **`slide:exportPptx` IPC** → host Save dialog → backend adapter.
- Tests: domain deck unit + pptx round-trip integration + Slides-editor integration + 3-way Office switcher + e2e. 65 tests total, gated coverage met. Screenshots: slides light + dark.

### Added — M3 Office · Docs
- **Pure DocData model** (`@saathi/domain`): blocks (h1/h2/p) + inline runs with bold/italic/underline; `docToHtml` (escaped) + `docPlainText` + `sampleDoc`.
- **docx export adapter** (`@saathi/backend`) behind `DocExportPort` via the `docx` lib — real `.docx` with headings + bold/italic/underline runs (Wrapper Rule: only this file imports `docx`; integration test unzips the file and asserts the text + a `<w:b>` bold run).
- **Word-style editor** (`@saathi/frontend`): a contenteditable page from the model, a B/I/U + H1/H2/¶ toolbar (`execCommand`), `htmlToDoc` serializer (unit-tested), serif headings, brand light/dark. Plus an **Office Sheets/Docs switcher** (Sheets M2 stays intact).
- **`doc:exportDocx` IPC** → host Save dialog → backend adapter.
- Tests: domain doc unit + `htmlToDoc` unit + docx round-trip integration + Office-switcher integration + e2e (render, switch, export). 56 tests total, gated coverage met. Screenshots: docs light + dark.

### Added — M2 Office · Sheets (first real engine)
- **`@saathi/domain`** (new pure package, ADR-0004): a real **formula engine** — recursive-descent evaluator (no `eval`), `+ - * / ()` precedence, cell refs, ranges, `SUM/AVERAGE/MIN/MAX/COUNT`, dependency chains, and error **values** (`#ERR`/`#CIRC`/`#DIV/0`). Shared by frontend (live edit) and backend (export).
- **ExcelJS export adapter** (`@saathi/backend`) behind `SpreadsheetExportPort` — emits a real `.xlsx` with values, `{formula, result}` cells, and a frozen header. The one file allowed to import ExcelJS (Wrapper Rule, enforced by lint + dependency-cruiser).
- **Editable Sheets grid** (`@saathi/frontend`): column letters + row numbers, frozen header, formula bar, contenteditable cells with **live recompute**, copper selection, brand light/dark.
- **`sheet:exportXlsx` IPC** → host Save dialog → backend adapter writes the file (composition root in `@saathi/desktop`).
- Tests: 16 domain unit + ExcelJS round-trip integration + grid integration + e2e (open, live recompute, export). 46 tests total, gated coverage met. Visual review: light + dark sheets screenshots committed.

### Added — M1 Shell & Themes (brand-locked)
- **Light · Medium · Dark** themes on the **LOCKED Keepvidya colour system** (ink + copper, one accent), tokens vendored verbatim from `Parent/keepvidya/keepvidya-theme.css` into `frontend/src/theme/keepvidya-theme.css` and mirrored 1:1 in the engine. Full semantic token set (text/surface/border/status/shadows/focus).
- **Theme gallery** popover in the topbar (3 brand swatches, Light/Dark groups, active marker) + quick light/dark toggle that **remembers the last light skin (Light vs Medium)**; full persistence.
- **Brand-lock guard** test: every theme's `--primary` must be brand copper and no theme may set a decorative background — fails CI if an off-brand colour is introduced.
- Tests: unit (3 themes apply, brand-lock, toggle memory), integration (gallery render/apply/close), e2e (Dark persists across relaunch) — 22 tests, gated coverage met. Visual review: Light/Medium/Dark screenshots committed.

### Added — M0 Walking Skeleton
- **Monorepo (npm workspaces) — backend ⟂ frontend, not a monolith** (ADR-0003): `@saathi/shared` (contracts), `@saathi/backend` (pure Node logic, no Electron/DOM), `@saathi/frontend` (UI, runs standalone in a browser), `@saathi/desktop` (thin Electron host wiring them over IPC).
- Secure Electron host (contextIsolation, sandbox, no nodeIntegration; typed `window.saathi` bridge, one method per IPC channel; prod CSP; external links to OS browser).
- Frontend shell: collapsible rail, pane router (O(1) registry), topbar, theme engine (light/dark; full 10-skin set in M1), stub panes for all sections.
- Boundary enforcement (ESLint `no-restricted-imports` + dependency-cruiser) — a cross-boundary import fails the build (verified by negative test).
- Engineering governance: ENGINEERING-PROTOCOL, ARCHITECTURE, BUILD-PLAN, ADR-0001/0002/0003, BA/DEV/QA/TEST-PLAN for `00-walking-skeleton`.
- Tooling: TypeScript (strict, per-package libs), ESLint + Prettier, dependency-cruiser, Vitest (unit + integration, 100% coverage on gated modules), Playwright-Electron e2e (+ light/dark screenshots), GitHub Actions CI.
