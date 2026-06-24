import { describe, expect, it } from 'vitest'
import { KatexMath, PlainMath } from '../src/adapters/katex/math.adapter'

describe('TC-11.1.1 — KaTeX renders valid TeX', () => {
  const m = new KatexMath()
  it('display mode produces KaTeX display markup', () => {
    const html = m.toHtml('a^2+b^2=c^2', true)
    expect(html).toContain('class="katex')
    expect(html).toContain('katex-display')
  })
  it('inline mode produces KaTeX markup without display wrapper', () => {
    const html = m.toHtml('x_i', false)
    expect(html).toContain('class="katex')
    expect(html).not.toContain('katex-display')
  })
})

describe('TC-11.1.2 — fallback + safety', () => {
  it('malformed TeX does not throw (throwOnError:false)', () => {
    expect(() => new KatexMath().toHtml('\\frac{1}{', true)).not.toThrow()
    expect(typeof new KatexMath().toHtml('\\frac{1}{', true)).toBe('string')
  })
  it('PlainMath escapes the source (no HTML injection)', () => {
    expect(new PlainMath().toHtml('<b>x</b>')).toBe('&lt;b&gt;x&lt;/b&gt;')
  })
})
