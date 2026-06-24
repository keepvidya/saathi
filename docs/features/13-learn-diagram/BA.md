# BA — 13-learn-diagram (Learn rich rendering: diagrams)

## 1. Problem & context
Concepts are often clearer as a **diagram** (a flow, a sequence, a tree) than as prose. This slice renders **Mermaid** diagrams inside lessons — the third renderer under the frontend Wrapper-Rule (ADR-0005). Unlike KaTeX/Shiki (CSS-variable theming), Mermaid bakes colours into the SVG, so theme changes **re-render** the diagram.

## 2. Users & jobs-to-be-done
- Primary: a learner. Job: "When a lesson explains a process, I want to see it as a diagram, so I grasp the structure at a glance."

## 3. User stories
- **US-1**: As a learner, I see a lesson **diagram** (e.g. a flowchart) rendered from its definition.
- **US-2**: As a learner, the diagram matches my **theme** (light/dark) and never blocks the lesson; a broken diagram degrades to its source text.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN a `diagram` block WHEN the lesson renders THEN Mermaid renders it to an SVG. *(→ TC-13.2.1, TC-13.3.1)*
- **AC-2** (US-2): GIVEN the diagram is async THEN the source shows immediately and is **progressively** replaced by the SVG; on a **theme switch** the diagram **re-renders** in the new theme. An invalid diagram degrades to its source text (no crash). *(→ TC-13.1.2, TC-13.2.2, TC-13.2.3)*
- **AC-3** (architecture): Mermaid is imported **only** inside `frontend/src/adapters/**` behind a `DiagramRenderPort` (frontend Wrapper-Rule). *(→ CI boundary)*

## 5. Scope
- **In**: a `diagram` block in the Lesson model (`@saathi/domain`, additive); a `DiagramRenderPort` + **Mermaid adapter** (`@saathi/frontend/adapters/mermaid`, lazy dynamic import, `securityLevel:'strict'`, theme→re-render) with a `PlainDiagram` fallback; the Learn pane rendering diagrams via progressive enhancement + a theme-change re-render.
- **Out** (later): Pyodide (runnable Python), Piper TTS; diagram editing, pan/zoom, click-interactions.

## 6. Success metrics / done-signal
Open Learn, see a flowchart rendered; switch theme and it re-renders to match; an invalid diagram shows its source; Mermaid never leaks outside its adapter (CI green).

## 7. Open questions / decisions for owner
- None. Mermaid loads lazily (only when a lesson has a diagram); themes map light→`neutral`, dark→`dark`.
