import { describe, it, expect } from 'vitest'
import { FiltersEngine, Request } from '@ghostery/adblocker'
import { Shields } from '../src/shields/shields'
import { STARTER_FILTERS } from '../src/index'
import { STARTER_FILTERS as FILTERS } from '../src/shields/filters'

describe('TC-16.1.1 — Shields tally', () => {
  it('starts enabled with zero blocked', () => {
    expect(new Shields().state()).toEqual({ enabled: true, blocked: 0 })
  })
  it('counts blocked requests while enabled', () => {
    const s = new Shields()
    s.recordBlocked()
    s.recordBlocked(2)
    expect(s.state().blocked).toBe(3)
  })
  it('toggling off stops counting; toggling on re-enables', () => {
    const s = new Shields()
    expect(s.toggle()).toBe(false)
    s.recordBlocked()
    expect(s.state()).toEqual({ enabled: false, blocked: 0 })
    s.setEnabled(true)
    s.recordBlocked()
    expect(s.state()).toEqual({ enabled: true, blocked: 1 })
  })
})

describe('TC-16.1.2 — STARTER_FILTERS block known trackers (core engine)', () => {
  const engine = FiltersEngine.parse(FILTERS)
  const matches = (url: string): boolean =>
    engine.match(Request.fromRawDetails({ url, type: 'script', sourceUrl: 'https://news.example/' }))
      .match

  it('exports the same filter string from the barrel', () => {
    expect(STARTER_FILTERS).toBe(FILTERS)
  })
  it('blocks doubleclick and google-analytics', () => {
    expect(matches('https://doubleclick.net/ad.js')).toBe(true)
    expect(matches('https://www.google-analytics.com/analytics.js')).toBe(true)
  })
  it('allows first-party / non-tracker scripts', () => {
    expect(matches('https://example.com/app.js')).toBe(false)
  })
})
