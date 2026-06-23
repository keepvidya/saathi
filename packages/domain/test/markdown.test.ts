import { describe, expect, it } from 'vitest'
import { markdownToHtml } from '../src/markdown/markdown'

describe('TC-08.1.1 — markdownToHtml renders & escapes', () => {
  it('inline bold/italic/code', () => {
    expect(markdownToHtml('**bold**')).toContain('<strong>bold</strong>')
    expect(markdownToHtml('*it*')).toContain('<em>it</em>')
    expect(markdownToHtml('`c`')).toContain('<code>c</code>')
  })
  it('headings and lists', () => {
    expect(markdownToHtml('# Title')).toBe('<h1>Title</h1>')
    expect(markdownToHtml('## Sub')).toBe('<h2>Sub</h2>')
    expect(markdownToHtml('- a\n- b')).toBe('<ul><li>a</li><li>b</li></ul>')
  })
  it('fenced code block (escaped)', () => {
    expect(markdownToHtml('```\nx < y\n```')).toBe('<pre><code>x &lt; y</code></pre>')
  })
  it('safe links only', () => {
    expect(markdownToHtml('[t](https://x.com)')).toContain('<a href="https://x.com">t</a>')
    expect(markdownToHtml('[t](javascript:alert(1))')).not.toContain('<a ')
  })
  it('escapes raw HTML (no XSS)', () => {
    const html = markdownToHtml('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })
  it('paragraphs', () => {
    expect(markdownToHtml('hello world')).toBe('<p>hello world</p>')
  })
})
