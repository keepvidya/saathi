// The ONLY file allowed to import mermaid (frontend Wrapper-Rule / vendor-only-in-adapter).
// Lazy dynamic import → Mermaid is a separate chunk, loaded only when a lesson has a diagram.

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

export type DiagramTheme = 'light' | 'dark'

/** Frontend seam: turn a Mermaid definition into rendered SVG (or a plain fallback). */
export interface DiagramRenderPort {
  render(code: string, theme: DiagramTheme): Promise<string>
}

const plain = (code: string): string => `<pre class="mmd-plain"><code>${esc(code)}</code></pre>`

/** Real diagram rendering via Mermaid. Lazy-loaded; never throws (falls back to source). */
export class MermaidDiagram implements DiagramRenderPort {
  private seq = 0

  async render(code: string, theme: DiagramTheme): Promise<string> {
    try {
      const { default: mermaid } = await import('mermaid')
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: theme === 'dark' ? 'dark' : 'neutral',
      })
      const id = `mmd-${Date.now()}-${this.seq++}`
      const { svg } = await mermaid.render(id, code)
      return svg
    } catch {
      return plain(code)
    }
  }
}

/** Deterministic fallback (tests / no Mermaid): escaped source in a <pre>. */
export class PlainDiagram implements DiagramRenderPort {
  async render(code: string): Promise<string> {
    return plain(code)
  }
}
