import { describe, expect, it } from 'vitest'
import { parseRef, formatRef, colName, expandRange } from '../src/sheet/cell-ref'

describe('TC-02.1.1 — cell refs & ranges', () => {
  it('parseRef', () => {
    expect(parseRef('B2')).toEqual({ col: 1, row: 2 })
    expect(parseRef('A1')).toEqual({ col: 0, row: 1 })
    expect(parseRef('AA10')).toEqual({ col: 26, row: 10 })
    expect(() => parseRef('nope')).toThrow()
  })
  it('colName / formatRef', () => {
    expect(colName(0)).toBe('A')
    expect(colName(26)).toBe('AA')
    expect(formatRef({ col: 4, row: 1 })).toBe('E1')
  })
  it('expandRange (any corner order)', () => {
    expect(expandRange('B2', 'D2')).toEqual(['B2', 'C2', 'D2'])
    expect(expandRange('D2', 'B2')).toEqual(['B2', 'C2', 'D2'])
    expect(expandRange('A1', 'B2')).toEqual(['A1', 'B1', 'A2', 'B2'])
  })
})
