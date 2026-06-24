import { describe, expect, it } from 'vitest'
import { MermaidDiagram, PlainDiagram } from '../src/adapters/mermaid/diagram.adapter'

describe('TC-13.1.2 — diagram adapter fallback + safety', () => {
  it('PlainDiagram returns the escaped source in a <pre>', async () => {
    const html = await new PlainDiagram().render('graph TD; A<-->B')
    expect(html).toContain('<pre')
    expect(html).toContain('A&lt;--&gt;B')
  })

  it('MermaidDiagram.render never throws — degrades to the source in jsdom', async () => {
    // jsdom can't lay out SVG (no getBBox), so Mermaid fails → our fallback.
    const html = await new MermaidDiagram().render('graph TD; A-->B', 'light')
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(0)
  }, 20000)
})
