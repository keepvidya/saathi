# DEV — 11-learn-math

## 1. Approach
Extend the Lesson model with a `math` block (`{ kind:'math'; tex; display? }`) and render it through a **`MathRenderPort`** implemented by a **KaTeX adapter** in `@saathi/frontend/adapters/katex`. KaTeX's `renderToString` is a pure TeX→HTML transform (no DOM, deterministic, unit-testable) — a perfect narrator-principle fit: our code typesets the formula, no model involved. This slice **establishes the frontend Wrapper-Rule**: the KaTeX adapter is the only file allowed to import `katex` (enforced by ESLint + dependency-cruiser, mirroring the backend rule). A `PlainMath` fallback (escaped source) keeps the pane testable without KaTeX and covers the unsupported path.

## 2. Ports touched
- **Frontend seam**: `MathRenderPort { toHtml(tex: string, display: boolean): string }` — impl `KatexMath` (`katex.renderToString`, `throwOnError:false`), fallback `PlainMath`.
- **CSP**: `font-src` gains `'self'` so KaTeX's bundled woff2 fonts load under `file://` when packaged. No IPC (rendering is a renderer concern).

## 3. Domain model
- `MathBlock = { kind:'math'; tex: string; display?: boolean }` added to the `LessonBlock` union (additive — non-breaking).
- `lessonPlainText` ignores math blocks (TeX isn't narration). `sampleLesson` gains a display formula.

## 4. Data structures & complexity (DSA)
| Operation | Time | Notes |
|---|---|---|
| Render one formula | O(t) | KaTeX parse+layout, t = TeX length; called once per math block at render |

## 5. Design patterns
- **Adapter** (KaTeX behind `MathRenderPort`), **Strategy/DIP** (pane depends on the port; `KatexMath` real / `PlainMath` fallback), **Composite** (math is just another lesson block).

## 6. External modules (Wrapper Rule — frontend)
| Vendor | Wrapped by | Port | Notes |
|---|---|---|---|
| **katex** | `frontend/src/adapters/katex/math.adapter.ts` (+ vendored `katex/dist/katex.min.css`) | `MathRenderPort` | **the only file importing katex**; new ESLint block + dep-cruiser `vendor-only-in-adapter` now also allow `^packages/frontend/src/adapters/` and list `katex`; `domain-stays-pure` forbids katex in domain |

## 7. Flow / sequence
Render: a `math` block → `math.toHtml(tex, display)` → `<div|span class="lsn-math">…KaTeX HTML…</div>`. The KaTeX CSS is imported inside the adapter module, so it ships only when the adapter is bundled.

## 8. Error handling
Invalid TeX → `throwOnError:false` renders the source in KaTeX's error style (no throw). If KaTeX itself is unavailable (tests) → `PlainMath` returns the escaped source. Never crashes the lesson.

## 9. Risks & mitigations
- **Fonts blocked by CSP when packaged** → CSP `font-src 'self'` added; visually verified.
- **Vendor leak** → frontend Wrapper-Rule (lint + dep-cruiser) fails CI if `katex` is imported outside the adapter.
- **XSS** → math comes from lesson authors (trusted content); KaTeX output is well-formed; the `tex` string is not user-from-the-web. Prose/code still go through the escape-first paths.

## 10. ADRs
A short ADR records the **frontend Wrapper-Rule** (vendor render libs isolated under `frontend/src/adapters/**`), since it's a new architectural convention reused by later renderers.
