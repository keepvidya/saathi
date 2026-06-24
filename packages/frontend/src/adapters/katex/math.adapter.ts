// The ONLY file allowed to import katex (frontend Wrapper-Rule / vendor-only-in-adapter).
// The CSS is imported here too, so KaTeX styling ships only when this adapter is bundled.
import katex from 'katex'
import 'katex/dist/katex.min.css'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

/** Frontend seam: typeset a TeX string to an HTML string. */
export interface MathRenderPort {
  toHtml(tex: string, display: boolean): string
}

/** Real math typesetting via KaTeX. Pure (TeX → HTML), deterministic, never throws. */
export class KatexMath implements MathRenderPort {
  toHtml(tex: string, display: boolean): string {
    return katex.renderToString(tex, { displayMode: display, throwOnError: false })
  }
}

/** Deterministic fallback (tests / no KaTeX): the escaped source as plain text. */
export class PlainMath implements MathRenderPort {
  toHtml(tex: string): string {
    return esc(tex)
  }
}
