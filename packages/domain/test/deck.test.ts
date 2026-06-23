import { describe, expect, it } from 'vitest'
import { sampleDeck, deckPlainText } from '../src/deck/deck'

describe('TC-04.1.1 — deck model', () => {
  it('sampleDeck has a title and ≥3 slides with content', () => {
    const d = sampleDeck()
    expect(d.title).toBeTruthy()
    expect(d.slides.length).toBeGreaterThanOrEqual(3)
    expect(d.slides[0].title).toBeTruthy()
    expect(d.slides[0].bullets.length).toBeGreaterThan(0)
  })
  it('deckPlainText includes title + a bullet', () => {
    const text = deckPlainText(sampleDeck())
    expect(text).toContain('Q3 Investor Update')
    expect(text).toContain('Net retention 119%')
  })
})
