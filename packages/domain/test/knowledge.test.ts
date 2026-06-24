import { describe, it, expect } from 'vitest'
import { chunkText, Corpus, retrieve, composeAnswer } from '../src/knowledge/knowledge'

// Fixtures — two short, clearly-distinct documents.
const PHOTOSYNTHESIS = {
  id: 'd1',
  title: 'Plant Biology',
  text:
    'Photosynthesis is the process by which green plants convert sunlight into chemical energy. ' +
    'Chlorophyll in the leaves absorbs light and powers the reaction. ' +
    'The plant takes in carbon dioxide and water and releases oxygen as a by-product.',
}

const TAXES = {
  id: 'd2',
  title: 'Personal Finance',
  text:
    'Income tax is a levy that governments place on the money people earn each year. ' +
    'Filing a return reports your income and calculates how much tax you owe. ' +
    'Deductions and credits can reduce the final amount due to the revenue service.',
}

describe('TC-09.1.1 — chunking + corpus', () => {
  it('chunks a long text into ≥2 non-empty, indexed pieces', () => {
    const para = 'A '.repeat(400).trim() // ~800 chars, one paragraph > size
    const long = `${para}\n\n${para}`
    const chunks = chunkText(long)
    expect(chunks.length).toBeGreaterThanOrEqual(2)
    for (const c of chunks) expect(c.trim().length).toBeGreaterThan(0)
  })

  it('splits ONE long multi-sentence paragraph on sentence boundaries (≤ size each)', () => {
    // 30 sentences, each ~40 chars → one ~1200-char paragraph, well over size=600.
    const sentence = 'The quick brown fox jumps over the dog. '
    const para = sentence.repeat(30).trim()
    const chunks = chunkText(para, 600)
    expect(chunks.length).toBeGreaterThan(1)
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(600)
    // No text is lost: every sentence's words survive across the chunks.
    expect(chunks.join(' ')).toContain('quick brown fox')
  })

  it('Corpus.add → chunks carry the source doc id + title', () => {
    const corpus = new Corpus()
    corpus.add(PHOTOSYNTHESIS)
    const chunks = corpus.chunks()
    expect(corpus.size()).toBe(chunks.length)
    expect(chunks.length).toBeGreaterThanOrEqual(1)
    for (const c of chunks) {
      expect(c.docId).toBe('d1')
      expect(c.docTitle).toBe('Plant Biology')
      expect(typeof c.index).toBe('number')
    }
    expect(corpus.docList().map((d) => d.id)).toEqual(['d1'])
  })
})

describe('TC-09.1.2 — retrieval ranks the matching passage first', () => {
  const corpus = new Corpus()
  corpus.add(PHOTOSYNTHESIS)
  corpus.add(TAXES)

  it('the matching chunk ranks first; the off-topic doc ranks lower or absent', () => {
    const hits = retrieve(corpus, 'how does photosynthesis work', 2)
    expect(hits.length).toBeGreaterThanOrEqual(1)
    expect(hits[0].chunk.text.toLowerCase()).toContain('photosynthesis')
    expect(hits[0].chunk.docId).toBe('d1')
    // No tax chunk should outrank the photosynthesis chunk.
    expect(hits.every((h, i) => i === 0 || h.score <= hits[0].score)).toBe(true)
  })

  it('respects k', () => {
    expect(retrieve(corpus, 'photosynthesis', 1)).toHaveLength(1)
  })

  it('empty query / empty corpus → no hits, no crash', () => {
    expect(retrieve(corpus, '   ', 4)).toEqual([])
    expect(retrieve(new Corpus(), 'photosynthesis', 4)).toEqual([])
  })
})

describe('TC-09.1.3 — extractive, cited, grounded answer', () => {
  const corpus = new Corpus()
  corpus.add(PHOTOSYNTHESIS)
  corpus.add(TAXES)

  it('answer is drawn verbatim from a source chunk and carries a [1] marker', () => {
    const hits = retrieve(corpus, 'what does photosynthesis convert', 4)
    const { answer } = composeAnswer('what does photosynthesis convert', hits)
    expect(answer).toContain('[1]')

    // Grounding: the quoted span (minus our prefix/suffix/clip ellipsis) must
    // appear verbatim in some source chunk — nothing invented.
    const quoted = answer.replace(/^Based on your documents:\s*/, '').replace(/\s*\[1\]$/, '')
    const core = quoted.replace(/…$/, '').trim()
    const sources = corpus.chunks().map((c) => c.text).join(' ')
    expect(sources).toContain(core)
  })

  it('citations point back to the source documents', () => {
    const hits = retrieve(corpus, 'photosynthesis sunlight', 4)
    const { citations } = composeAnswer('photosynthesis sunlight', hits)
    expect(citations.length).toBeGreaterThanOrEqual(1)
    expect(citations[0]).toMatchObject({ n: 1, docTitle: 'Plant Biology' })
    expect(citations[0].snippet.length).toBeGreaterThan(0)
    citations.forEach((c, i) => expect(c.n).toBe(i + 1))
  })

  it('empty hits → graceful, citation-free answer', () => {
    const { answer, citations } = composeAnswer('anything', [])
    expect(citations).toEqual([])
    expect(answer.toLowerCase()).toContain('couldn’t find'.toLowerCase())
  })
})
