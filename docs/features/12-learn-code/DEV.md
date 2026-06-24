# DEV — 12-learn-code

## 1. Approach
A frontend-only render upgrade: the domain `code` block is unchanged. The Learn pane renders the **escaped plain code synchronously** (the existing fallback), then **asynchronously** highlights each block with **Shiki** and swaps the markup in — *progressive enhancement* so the lesson never waits on the highlighter. Shiki sits behind a **`CodeHighlightPort`** in `frontend/src/adapters/shiki` (frontend Wrapper-Rule, ADR-0005), with a synchronous-result `PlainHighlight` fallback for tests and unsupported cases. Shiki runs on its **JavaScript RegExp engine** (no WASM → no `wasm-unsafe-eval` CSP change) and emits **dual-theme** output (`--shiki-light` / `--shiki-dark` CSS variables, `defaultColor:false`) so light/dark follow our `data-theme` with **no re-render**.

## 2. Ports touched
- **Frontend seam**: `CodeHighlightPort { highlight(code: string, lang: string): Promise<string> }` — impl `ShikiHighlight` (lazy singleton highlighter), fallback `PlainHighlight` (escaped `<pre>`).
- No domain, IPC, backend, or CSP change.

## 3. Domain model
Unchanged (`CodeBlock { kind:'code'; lang; source }` from M8).

## 4. Data structures & complexity (DSA)
| Operation | Time | Notes |
|---|---|---|
| Create highlighter | O(L) once | L = bundled languages; lazy singleton, reused |
| Highlight a block | O(n) | n = code length; async, off the render path |

## 5. Design patterns
- **Adapter** (Shiki behind `CodeHighlightPort`), **Strategy/DIP** (`ShikiHighlight` real / `PlainHighlight` fallback, injected into the pane), **Progressive enhancement** (plain first, highlighted when ready), **Lazy singleton** (one highlighter instance).

## 6. External modules (Wrapper Rule — frontend)
| Vendor | Wrapped by | Port | Notes |
|---|---|---|---|
| **shiki** (+ `shiki/engine/javascript`) | `frontend/src/adapters/shiki/highlight.adapter.ts` | `CodeHighlightPort` | **the only file importing shiki**; ESLint `^shiki(/|$)` outside `adapters/**` + dep-cruiser `vendor-only-in-adapter`/`domain-stays-pure` extended with `shiki` |

## 7. Flow / sequence
Render: code block → `<div class="lsn-code" data-code="i">… plain <pre> …</div>` (immediate). After mount: for each code block call `highlight(source, lang)`; on resolve, replace the block's `.lsn-code-body` with the Shiki HTML. CSS maps `--shiki-light`/`--shiki-dark` to token colour per `data-theme`; the wrapper keeps the brand surface/border + language label.

## 8. Error handling
Unknown language → fall back to `text` (plain). Any highlighter failure → keep the plain fallback already on screen (caught, never throws). Empty code → empty block, no crash.

## 9. Risks & mitigations
- **WASM under CSP** → avoided by the JS RegExp engine (no `wasm-unsafe-eval`).
- **Blocking render / async race** → plain code shows first; the swap is idempotent and per-block.
- **Bundle size** → bundle a fixed small language set + two themes only; JS engine, no extra WASM asset.
- **Vendor leak** → frontend Wrapper-Rule fails CI if `shiki` is imported outside the adapter.

## 10. ADRs
Reuses ADR-0005 (frontend Wrapper-Rule). No new ADR.
