import { describe, expect, it } from 'vitest'
import { Sheet, budgetSheet } from '../src/sheet/sheet'

describe('TC-02.1.1 — enter data', () => {
  it('stores and displays raw values', () => {
    const s = new Sheet()
    s.setRaw('A1', 'Item')
    s.setRaw('B2', '120')
    expect(s.display('A1')).toBe('Item')
    expect(s.display('B2')).toBe('120')
    s.setRaw('B2', '')
    expect(s.display('B2')).toBe('')
  })
})

describe('TC-02.1.5 — dependency chains recompute', () => {
  it('formula reflects current inputs', () => {
    const s = budgetSheet()
    expect(s.display('E2')).toBe('447') // =SUM(B2:D2)
    expect(s.display('E4')).toBe('182') // profit total: (120-80)+(150-90)+(177-95)=40+60+82
  })

  it('recomputes dependents when an input changes', () => {
    const s = budgetSheet()
    expect(s.evaluate('E2')).toBe(447)
    s.setRaw('B2', '100')
    expect(s.evaluate('E2')).toBe(427) // SUM(100,150,177)
    expect(s.evaluate('B4')).toBe(20) // =B2-B3 = 100-80
  })
})

describe('TC-02.1.6 — circular & error values', () => {
  it('self-reference → #CIRC', () => {
    const s = new Sheet()
    s.setRaw('A1', '=A1')
    expect(s.evaluate('A1')).toBe('#CIRC')
    expect(s.display('A1')).toBe('#CIRC')
  })
  it('mutual reference → #CIRC', () => {
    const s = new Sheet()
    s.setRaw('A1', '=B1+1')
    s.setRaw('B1', '=A1+1')
    expect(s.evaluate('A1')).toBe('#CIRC')
  })
  it('division by zero & malformed → error codes', () => {
    const s = new Sheet()
    s.setRaw('A1', '=1/0')
    s.setRaw('A2', '=SUM(')
    expect(s.evaluate('A1')).toBe('#DIV/0')
    expect(s.evaluate('A2')).toBe('#ERR')
  })
  it('text in arithmetic counts as 0', () => {
    const s = new Sheet()
    s.setRaw('A1', 'hello')
    s.setRaw('A2', '=A1+5')
    expect(s.evaluate('A2')).toBe(5)
  })
})

describe('serialization', () => {
  it('round-trips via toData/from', () => {
    const s = budgetSheet()
    const copy = Sheet.from(s.toData())
    expect(copy.display('E2')).toBe('447')
    expect(copy.getRaw('E2')).toBe('=SUM(B2:D2)')
  })
})
