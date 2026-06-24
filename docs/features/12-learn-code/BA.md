# BA — 12-learn-code (Learn rich rendering: code highlighting)

## 1. Problem & context
Lesson code blocks are currently plain monospace text. Real learning material has **syntax-highlighted** code — colour makes structure obvious and code readable. This slice highlights code with **Shiki** (VS Code-grade), reusing the **frontend Wrapper-Rule** (ADR-0005) and adding the first **async** render adapter (the pattern Mermaid / Pyodide will reuse).

## 2. Users & jobs-to-be-done
- Primary: a learner reading code in a lesson. Job: "When a lesson shows code, I want it syntax-highlighted, so I can read and understand it quickly."

## 3. User stories
- **US-1**: As a learner, I see lesson code **syntax-highlighted** by language.
- **US-2**: As a learner, highlighting follows my **theme** (light/dark) and never blocks the lesson from showing.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN a `code` block WHEN the lesson renders THEN the code is highlighted by Shiki (token markup present), per its language. *(→ TC-12.1.1, TC-12.2.1, TC-12.3.1)*
- **AC-2** (US-2): GIVEN highlighting is async THEN the plain code shows immediately and is **progressively** replaced by the highlighted version; output adapts to light/dark via CSS variables (no re-render). An unknown language or failure degrades to plain code (no crash). *(→ TC-12.1.2, TC-12.2.2)*
- **AC-3** (architecture): Shiki is imported **only** inside `frontend/src/adapters/**` behind a `CodeHighlightPort` (frontend Wrapper-Rule), enforced by ESLint + dependency-cruiser. *(→ CI boundary)*

## 5. Scope
- **In**: a `CodeHighlightPort` + **Shiki adapter** (`@saathi/frontend/adapters/shiki`, JS RegExp engine — no WASM, no CSP change; dual github-light/dark themes via CSS vars) with a deterministic `PlainHighlight` fallback; the Learn pane upgrading code blocks via **progressive enhancement** (plain → highlighted).
- **Out** (later): Mermaid (diagrams), Pyodide (runnable Python), Piper TTS; line numbers, copy-button, per-line highlighting.

## 6. Success metrics / done-signal
Open Learn, see the code block syntax-highlighted, readable in light + dark; an unknown language still shows as plain code; Shiki never leaks outside its adapter (CI green).

## 7. Open questions / decisions for owner
- None. Bundled languages: a sensible default set (js/ts/python/json/bash/html/css/markdown); more can be added in the adapter later.
