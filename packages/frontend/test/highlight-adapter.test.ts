import { describe, expect, it } from 'vitest'
import { ShikiHighlight, PlainHighlight } from '../src/adapters/shiki/highlight.adapter'

describe('TC-12.1.1 — Shiki highlights known code', () => {
  it('produces dual-theme Shiki markup for javascript', async () => {
    const html = await new ShikiHighlight().highlight('const x = 1', 'javascript')
    expect(html).toContain('class="shiki')
    expect(html).toContain('--shiki-dark') // dual-theme CSS vars (defaultColor:false)
    expect(html).toContain('--shiki-light')
  }, 20000)
})

describe('TC-12.1.2 — fallback + safety', () => {
  it('an unknown language does not throw (falls back to text)', async () => {
    const html = await new ShikiHighlight().highlight('x = 1', 'no-such-lang')
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(0)
  }, 20000)

  it('PlainHighlight returns the escaped source in a <pre>', async () => {
    const html = await new PlainHighlight().highlight('<b>x</b>')
    expect(html).toContain('<pre')
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;')
  })
})
