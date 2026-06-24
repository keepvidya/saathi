// The ONLY file allowed to import shiki (frontend Wrapper-Rule / vendor-only-in-adapter).
// Use the fine-grained `shiki/core` API with EXPLICIT theme/lang imports + the JS RegExp
// engine: this bundles only what we list (no full grammar registry, no WASM) — the
// convenience `shiki` entry would code-split ~every language (emacs-lisp, wolfram, …).
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import githubLight from 'shiki/themes/github-light.mjs'
import githubDark from 'shiki/themes/github-dark.mjs'
import langJs from 'shiki/langs/javascript.mjs'
import langTs from 'shiki/langs/typescript.mjs'
import langPy from 'shiki/langs/python.mjs'
import langJson from 'shiki/langs/json.mjs'
import langBash from 'shiki/langs/bash.mjs'
import langHtml from 'shiki/langs/html.mjs'
import langCss from 'shiki/langs/css.mjs'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

const THEMES = { light: 'github-light', dark: 'github-dark' } as const

/** Frontend seam: turn source code into highlighted HTML. */
export interface CodeHighlightPort {
  highlight(code: string, lang: string): Promise<string>
}

/** Real syntax highlighting via Shiki. Lazy singleton; never throws (falls back to plain). */
export class ShikiHighlight implements CodeHighlightPort {
  private static loader: Promise<HighlighterCore> | undefined

  private static get(): Promise<HighlighterCore> {
    ShikiHighlight.loader ??= createHighlighterCore({
      themes: [githubLight, githubDark],
      langs: [langJs, langTs, langPy, langJson, langBash, langHtml, langCss],
      engine: createJavaScriptRegexEngine(),
    })
    return ShikiHighlight.loader
  }

  async highlight(code: string, lang: string): Promise<string> {
    try {
      const hl = await ShikiHighlight.get()
      const useLang = hl.getLoadedLanguages().includes(lang) ? lang : 'text'
      return hl.codeToHtml(code, { lang: useLang, themes: THEMES, defaultColor: false })
    } catch {
      return `<pre class="shiki-plain"><code>${esc(code)}</code></pre>`
    }
  }
}

/** Deterministic fallback (tests / no Shiki): escaped source in a <pre>. */
export class PlainHighlight implements CodeHighlightPort {
  async highlight(code: string): Promise<string> {
    return `<pre class="shiki-plain"><code>${esc(code)}</code></pre>`
  }
}
