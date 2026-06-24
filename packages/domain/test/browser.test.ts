import { describe, it, expect } from 'vitest'
import { parseAddress, TabSet, DEFAULT_SEARCH } from '../src/browser/browser'

describe('TC-15.1.1 — parseAddress classifies URL vs search', () => {
  it('keeps an explicit scheme as-is', () => {
    expect(parseAddress('https://example.com')).toEqual({ kind: 'url', url: 'https://example.com' })
    expect(parseAddress('about:blank')).toEqual({ kind: 'url', url: 'about:blank' })
  })
  it('prefixes a bare domain with https', () => {
    expect(parseAddress('example.com')).toEqual({ kind: 'url', url: 'https://example.com' })
    expect(parseAddress('example.com/path?q=1')).toEqual({
      kind: 'url',
      url: 'https://example.com/path?q=1',
    })
  })
  it('treats localhost and IPs as URLs', () => {
    expect(parseAddress('localhost:5173').url).toBe('https://localhost:5173')
    expect(parseAddress('127.0.0.1:8080').url).toBe('https://127.0.0.1:8080')
  })
  it('treats free text as a search', () => {
    const r = parseAddress('how do magnets work')
    expect(r.kind).toBe('search')
    expect(r.url).toBe(`${DEFAULT_SEARCH}how%20do%20magnets%20work`)
  })
  it('respects a custom search engine', () => {
    const r = parseAddress('rust traits', 'https://search.local/?q=')
    expect(r.url).toBe('https://search.local/?q=rust%20traits')
  })
  it('empty input → about:blank', () => {
    expect(parseAddress('   ')).toEqual({ kind: 'url', url: 'about:blank' })
  })
  it('a single word with no dot is a search, not a host', () => {
    expect(parseAddress('weather').kind).toBe('search')
  })
})

describe('TC-15.1.2 — TabSet state machine', () => {
  it('opens tabs, tracks the active one, unique ids', () => {
    const set = new TabSet()
    const a = set.open('https://a.com')
    const b = set.open('https://b.com')
    expect(a).not.toBe(b)
    expect(set.count()).toBe(2)
    expect(set.active()?.id).toBe(b)
    expect(set.activeIdOrUndefined()).toBe(b)
    expect(set.list().map((t) => t.id)).toEqual([a, b]) // a defensive copy, in order
  })

  it('updates a tab in place', () => {
    const set = new TabSet()
    const a = set.open()
    set.update(a, { title: 'Alpha', url: 'https://a.com', canGoBack: true })
    expect(set.active()).toMatchObject({ title: 'Alpha', url: 'https://a.com', canGoBack: true })
  })

  it('closing the active tab activates a neighbour', () => {
    const set = new TabSet()
    const a = set.open()
    const b = set.open()
    set.activate(a)
    set.close(a)
    expect(set.active()?.id).toBe(b) // fell back to the remaining tab
  })

  it('closing the last tab leaves no active tab (host opens a fresh one)', () => {
    const set = new TabSet()
    const a = set.open()
    set.close(a)
    expect(set.count()).toBe(0)
    expect(set.active()).toBeUndefined()
  })

  it('activate / update / close ignore unknown ids', () => {
    const set = new TabSet()
    const a = set.open()
    set.activate(999)
    set.update(999, { title: 'nope' })
    set.close(999)
    expect(set.active()?.id).toBe(a)
    expect(set.count()).toBe(1)
  })
})
