# Changelog

All notable changes to Saathi are documented here. Format: [Keep a Changelog](https://keepachangelog.com); versioning: [SemVer](https://semver.org).

## [Unreleased]

### Added — M11d Hardware check + Ollama/Shiva setup (onboarding, locked design)
- **Onboarding redesigned to the locked prototype**: name → **how Saathi should think** → embedding. Step two **checks your computer** ("It checked your computer (15.6 GB RAM) — Lite fits well") and recommends **Ultra-Lite (1.5B)**, **Lite (7B)**, or **Heavy (cloud BYOK)**.
- **The installer bundles neither Ollama nor Shiva.** For an offline mode, Saathi **pulls the matching Shiva model** (`shiva-nano:1.5b` / `shiva-chat:7b`) — **silently installing Ollama first if it's missing** (downloads the official `OllamaSetup.exe`, runs it silently) — with a live progress bar. Heavy mode takes a cloud key instead (stored encrypted). All hardware detection + Ollama install/pull happen in the **main process** only.
- New `system:hardware` / `ollama:status` / `ollama:setup` (+ progress push) IPC + `bridge.setupControl`; `runMode` + `embedding` added to settings; `SHIVA_MODELS` map in shared.
- Tests: onboarding integration (hardware check + recommendation; offline pulls the right Shiva tag; Heavy key path) with a mocked setup; e2e (the mode step with the real RAM check). 238 unit/int + 21 e2e green. Screenshots: onboarding (mode step) light + dark. The live install/pull runs on the user's machine (mock-tested in dev/CI).

### Added — M11c Packaging (Windows installer) + auto-update scaffold
- **A real Windows installer**: `npm run package` builds a NSIS **`Saathi-Setup-<version>.exe`** via **electron-builder** (choose-folder, Start-menu shortcut). **Pyodide is `asar`-unpacked** so runnable Python works in the installed app; **`electron-updater`** is wired (packaged-only, guarded) against a GitHub release feed (releases publish in M12).
- Workspace packaging fixes: pin `electronVersion` (electron is hoisted); `npmRebuild:false` (electron-builder's dep-rebuild was pruning the hoisted root `node_modules`); `@saathi/*` moved to **devDependencies** (they're bundled into `out/` and symlink outside the app, so they must not be packaged).
- **Verified**: the installer builds (~114 MB); a packaged smoke test of `win-unpacked/Saathi.exe` confirms it **boots → onboarding → shell → runs Python** (the Pyodide asar-unpack is correct). All 21 dev e2e still pass (unpackaged → shell, no updater). The `.exe` is unsigned for now (SmartScreen warns) — signing + a branded icon are follow-ups.

### Added — M11b First-run onboarding wizard
- **A short, branded first-run wizard**: *"Hi — I'm Saathi… what should I call you?"* → **how the AI runs** (Offline = local Ollama + Shiva, or Cloud BYOK + key) → **web search** (None / Serper / Brave + key) → done. It writes into the M11a settings, storing any keys **encrypted**, then mounts the app — and won't ask again.
- **First-run is gated in main**: `app:firstRun` returns true only in a **packaged** build that isn't onboarded yet (or with `--force-onboarding`), so dev and all existing e2e get the shell directly — **no spec changes, all 20 prior e2e still pass**. `startApp(root)` boots the wizard-or-shell; the renderer entry now calls it.
- Tests: wizard integration (walk → save settings + `onboarded:true` → `onDone`; cloud path stores an encrypted key; Back), `bridge.firstRun`, preload contract, e2e (`--force-onboarding` → wizard → app). 238 unit/int + 21 e2e green; coverage met. Screenshots: onboarding light + dark.

### Added — M11a Settings + encrypted keys
- **A real Settings pane** (Profile · AI provider · Web search · Appearance · About): set your **name** and **theme**, choose **Offline (local Ollama + Shiva)** or **Cloud (BYOK)**, pick a web-search provider (None / Serper / Brave), and save provider **API keys**.
- **Keys are encrypted at rest** via Electron **`safeStorage`** (OS-backed: Windows DPAPI), wrapped in a main-process `SecretStore` (ADR-0008). The renderer can **set / check-presence / clear** a key but **never read it** — there is deliberately no `secret:get` IPC; plaintext keys live only in main. The UI shows a key only as "Set ✓ (encrypted)". Non-secret config is a JSON `SettingsPort`/`JsonSettings` (`@saathi/backend`, unit-tested).
- `settings:*` + `secret:*` IPC + `bridge.settingsControl`. This is the config the onboarding wizard (M11b) writes into.
- Tests: `JsonSettings` units (defaults/merge/persist/corrupt), Settings-pane integration (load, save name/provider, key set→presence→clear, value never rendered), security contract (no `secret:get`), e2e. 234 unit/int + 20 e2e green; coverage met. Screenshots: settings light + dark.

### Added — M10c Skills (reusable recipes)
- **Skills** — a catalogue of named, reusable recipes (Calculator, Look up, Percentage, Tip splitter, Average). Each skill turns a small input into an **agent goal** and routes it through the **real** worker tools (calc / search), so the answer is **computed, not invented** — and the pane shows the goal it built (e.g. "15% of 240" → `(240 * 15 / 100)` → 36; "120, 4, 18" → `(120 * (1 + 18 / 100)) / 4` → 35.4). The stub Skills pane is now real.
- **Pure core** (`@saathi/domain/agent/skills`): `Skill` + `SkillRegistry` + `BUILTIN_SKILLS` + `runSkill` (= `runDefaultAgent(skill.toGoal(input))`) — deterministic templates composing M10a, fully unit-tested; malformed input falls back to the raw text (no crash). No new vendor/IPC.
- Tests: skill-registry + per-skill `toGoal`/`runSkill` units (exact answers), Skills-pane integration (catalogue + run shows answer + goal), e2e (run Tip/Percentage → computed answer). 227 unit/int + 19 e2e green; coverage met. Screenshots: skills light + dark.
- **M10 (Agent + Skills + Memory) complete.** Deferred: user-defined / learned skills (persisted via Memory), the agent using memory as a tool, an LLM planner.

### Added — M10b Memory (full-text, local)
- **Memory** — save private notes and **recall them by relevance**, locally. A new Memory pane: write a note, search your memory, see recent notes (newest first), forget one. Memory **persists** across restarts.
- **Recall is computed by our own engine** (ADR-0007): a `MemoryPort` + a **`JsonMemory`** adapter (`@saathi/backend`) persists items to a JSON file and ranks recall with **the same TF-IDF retrieval as Knowledge** — no native module, no vendor, fully node-testable. (SQLite-FTS5 stays a clean future swap behind the same port — `better-sqlite3` is a native addon needing an Electron-ABI rebuild; deferred to packaging.) `memory:*` IPC + `bridge.memory`; the file lives in the app's userData dir.
- Tests: `JsonMemory` units (remember/recall-ranking/list/forget/persistence/corrupt-file, temp file), Memory-pane integration (save → list → recall → forget), e2e (save → recall a real persisted note). 216 unit/int + 18 e2e green; coverage met. Screenshots: memory light + dark.
- **Deferred → M10c Skills**, the agent using memory as a tool, SQLite-FTS5, tags/edit.

### Added — M10a Agent (tool-using ReAct loop)
- **The Agent** — Saathi's "AI employee": give it a goal, a **supervisor reasons**, **delegates to worker tools** that do the real work, observes, and answers — showing its step trace. Per our DNA the **tools compute the truth**: **calc** uses the M2 formula engine (exact arithmetic, no `eval`), **search** answers from a built-in knowledge base (extractive + cited). The supervisor only routes and phrases.
- **Pure core** (`@saathi/domain/agent`): a `Tool` + `ToolRegistry` abstraction, real builtin tools (`calc`, `search`), and a **bounded ReAct `runAgent`** loop driven by a `Planner`. The default **`RulefulPlanner`** routes deterministically (math → calc, questions → search) — fully offline and testable; a model can narrate/route later behind the same seam. The loop is `maxSteps`-bounded (no runaway) and records an ordered reason/act/observe/answer trace.
- **Agent pane** (`@saathi/frontend`): a goal input, the live supervisor→worker **step trace** (phase-styled, agent-labelled), and the final answer.
- Tests: tool units (calc exact + error values, search grounded), `runAgent` routing/trace/bound/robustness units, `RulefulPlanner` routing, Agent-pane integration, e2e (goal → trace → exact answer). 207 unit/int + 17 e2e green; coverage met. Screenshots: agent light (calc) + dark (search).
- **Deferred → M10b Memory** (SQLite-FTS5), **M10c Skills**, an LLM planner, MCP tools, side-effecting tools.

### Added — M9b Browser · Shields (ad/tracker blocking)
- **Shields**: the browser now **blocks ads and trackers** by default, offline. A real engine (`@ghostery/adblocker-electron`) runs in the **main process** over a bundled curated filter list and cancels matching requests on the tabs' session; the toolbar shows a 🛡 **blocked-count** badge, and a click **toggles** Shields off/on.
- The engine imports Electron, so — unlike pdf.js/Pyodide — it's wrapped in **`desktop/main/ad-block.ts`** (the only importer; the composition root), not `@saathi/backend`. The **filter list + the Shields tally live in `@saathi/domain`** (pure), so the same rules are **verified by the core `@ghostery/adblocker` engine in a unit test** (no electron) — blocks `doubleclick.net`/`google-analytics.com`, allows first-party scripts.
- The browser snapshot gained `shields` state; a `browser:toggleShields` command flips it; block bursts are throttled (~150 ms) so tracker-heavy pages don't spam IPC. **No CSP change, no renderer involvement.**
- Tests: `Shields` tally + filter-rules units, Browser-pane integration (badge count + toggle state), e2e (a `data:` page references a tracker → the count rises → toggle off). 192 unit/int + 16 e2e green; coverage met. Screenshots: browser-shields light + dark.
- **Browser + Shields complete.** Deferred: full/auto-updating lists, cosmetic filters, per-site allowlist, history/bookmarks/downloads, SearXNG, agent-drive.

### Added — M9a Browser (multi-tab, WebContentsView)
- **A real multi-tab browser** inside Saathi: open/switch/close tabs, back/forward/reload, and a combined **address + search** bar. Web content runs in sandboxed **WebContentsView**s in the **main process** (`contextIsolation`, `sandbox`, no `nodeIntegration`, isolated session) — never in the app renderer; `window.open`/`target=_blank` opens a new in-app tab, not a popup.
- **Deterministic core** (`@saathi/domain/browser`): `parseAddress` decides URL vs search (scheme/localhost/IP/`host.tld` → navigate; otherwise → a DuckDuckGo search) and `TabSet` is the tab/active-tab state machine — *our code*, fully unit-tested.
- **New IPC patterns**: a typed `browser:*` command set (invoke) **plus the app's first main→renderer push channel** (`browser:event`) for live tab/nav state; the preload gained an allow-listed `onEvent` subscription. The Browser pane reports its content-region bounds so the active view is sized to fit, and hides the views when you navigate away.
- Tests: domain units (`parseAddress` cases, `TabSet` state machine), Browser-pane integration (pushed-state reflection, address→navigate, tab/toolbar controls, self-cleanup on leave), e2e (open → navigate a `data:` page → title/address update → multi-tab; no network). 184 unit/int + 15 e2e green; coverage met. Screenshots: browser light + dark.
- **Deferred → M9b Shields:** ad/tracker blocking (`@ghostery/adblocker-electron`), plus later history/bookmarks/downloads, self-hosted SearXNG, agent-drive.

### Added — M8e Learn · Runnable code (Pyodide, in the main process)
- **Runnable Python snippets**: a `runnable` flag on the `code` block (`@saathi/domain`, additive) adds a **Run** button; clicking executes the code with **real CPython (Pyodide)** and shows its actual stdout — the narrator principle at full strength (the output is *real program output*, offline). A Python error shows the error text, not a crash.
- **Pyodide runs in the main process** (ADR-0006), behind a `PyRunPort` + `PyodideRun` adapter (`@saathi/backend`, lazy singleton, explicit `indexURL`) reached via a `py:run` IPC channel + `bridge.runPython`. The renderer never touches WASM, so there is **no CSP change** and no `unsafe-eval` — consistent with the privacy/security baseline. The backend Wrapper Rule now covers `pyodide`.
- Tests: Pyodide adapter units (stdout capture, error reporting, empty run), bridge unit (host + "needs the app" fallback), preload contract (`py.run`), Learn-pane integration (Run button presence, success/error output), e2e (real Python output in the app). 167 unit/int + 14 e2e green; coverage met. Screenshots: learn-run light + dark.
- **Learn is now fully featured** (quiz engine · read-aloud · KaTeX math · Shiki code · Mermaid diagrams · runnable Python). Piper TTS remains an optional future swap behind `SpeechPort`.

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
