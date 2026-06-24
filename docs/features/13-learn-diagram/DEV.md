# DEV — 13-learn-diagram

## 1. Approach
Add a `diagram` block (`{ kind:'diagram'; code; title? }`) and render it through a **`DiagramRenderPort`** implemented by a **Mermaid adapter** in `frontend/src/adapters/mermaid` (frontend Wrapper-Rule, ADR-0005). Mermaid is **lazy dynamic-imported** (loaded only when a lesson has a diagram; a separate Vite chunk, keeping it out of the main bundle) and run with `securityLevel:'strict'`. The Learn pane uses **progressive enhancement** — the diagram source shows immediately, then the SVG swaps in. Unlike KaTeX/Shiki, Mermaid bakes colours into the SVG, so the pane installs a **`MutationObserver`** on `<html data-theme>` and **re-renders** diagrams on a theme switch (self-disconnecting once the pane leaves the DOM). A `PlainDiagram` fallback (escaped source) keeps the pane testable and covers invalid diagrams.

## 2. Ports touched
- **Frontend seam**: `DiagramRenderPort { render(code: string, theme: 'light'|'dark'): Promise<string> }` — impl `MermaidDiagram` (lazy import, theme→`neutral`/`dark`), fallback `PlainDiagram`.
- No domain logic change beyond the block type; no IPC, backend, or CSP change (Mermaid injects SVG + inline styles, allowed by the existing `style-src 'unsafe-inline'`).

## 3. Domain model
- `DiagramBlock = { kind:'diagram'; code: string; title?: string }` added to `LessonBlock` (additive). `lessonPlainText` skips diagrams. `sampleLesson` gains a small flowchart.

## 4. Data structures & complexity (DSA)
| Operation | Time | Notes |
|---|---|---|
| Render a diagram | O(n) | n = definition size; async, off the render path |
| Theme re-render | O(d) | d = diagrams on screen; only on a theme switch |

## 5. Design patterns
- **Adapter** (Mermaid behind `DiagramRenderPort`), **Strategy/DIP** (`MermaidDiagram`/`PlainDiagram` injected), **Progressive enhancement** (source → SVG), **Observer** (re-render on `data-theme` change, self-cleaning).

## 6. External modules (Wrapper Rule — frontend)
| Vendor | Wrapped by | Port | Notes |
|---|---|---|---|
| **mermaid** | `frontend/src/adapters/mermaid/diagram.adapter.ts` | `DiagramRenderPort` | **the only file importing mermaid** (lazy `import('mermaid')`); ESLint `^mermaid(/|$)` outside `adapters/**` + dep-cruiser `vendor-only-in-adapter`/`domain-stays-pure` extended with `mermaid` |

## 7. Flow / sequence
Render: diagram block → `<div class="lsn-diagram" data-diagram="i">… plain <pre> …</div>` (immediate). After mount: `renderDiagrams(theme)` calls `render(code, theme)` per block → swaps `.lsn-diagram-body` with the SVG. A `MutationObserver` on `<html data-theme>` calls `renderDiagrams(newTheme)` again; if the pane root has left the DOM it disconnects.

## 8. Error handling
Invalid diagram or Mermaid failure → caught → the plain source `<pre>` stays/returns (no crash). Empty code → empty block.

## 9. Risks & mitigations
- **Theme not reflected** → MutationObserver re-render with the matching Mermaid theme.
- **Observer leak on navigation** → the callback disconnects itself when `document` no longer contains the pane root.
- **Bundle size** → Mermaid is lazy dynamic-imported (own chunk, only on a diagram lesson).
- **Diagram-injected HTML** → `securityLevel:'strict'` sanitises; lesson content is trusted authoring, not web input.
- **Vendor leak** → frontend Wrapper-Rule fails CI if `mermaid` is imported outside the adapter.

## 10. ADRs
Reuses ADR-0005 (frontend Wrapper-Rule). No new ADR.
