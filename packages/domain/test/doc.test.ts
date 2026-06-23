import { describe, expect, it } from 'vitest'
import { docToHtml, docPlainText, sampleDoc } from '../src/doc/doc'

describe('TC-03.1.1 — docToHtml renders & escapes', () => {
  it('renders headings and paragraphs', () => {
    expect(docToHtml({ blocks: [{ type: 'h1', runs: [{ text: 'Title' }] }] })).toContain('<h1>Title</h1>')
  })
  it('wraps marks (bold/italic/underline)', () => {
    const html = docToHtml({
      blocks: [{ type: 'p', runs: [{ text: 'x', marks: ['bold', 'italic', 'underline'] }] }],
    })
    expect(html).toBe('<p><strong><em><u>x</u></em></strong></p>')
  })
  it('escapes text (no injection)', () => {
    const html = docToHtml({ blocks: [{ type: 'p', runs: [{ text: 'a < b & c' }] }] })
    expect(html).toBe('<p>a &lt; b &amp; c</p>')
    expect(html).not.toContain('a < b')
  })
  it('docPlainText includes the title', () => {
    expect(docPlainText(sampleDoc())).toContain('Project Proposal')
  })
})
