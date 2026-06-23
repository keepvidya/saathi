import { describe, expect, it } from 'vitest'
import { evalFormula, FormulaError } from '../src/sheet/formula'

const cells: Record<string, number> = { B2: 120, C2: 150, D2: 177 }
const resolve = (ref: string): number => cells[ref] ?? 0

describe('TC-02.1.2 — arithmetic & precedence', () => {
  it('respects precedence and parens', () => {
    expect(evalFormula('2+3*4', resolve)).toBe(14)
    expect(evalFormula('(2+3)*4', resolve)).toBe(20)
    expect(evalFormula('10/4', resolve)).toBe(2.5)
    expect(evalFormula('-5+2', resolve)).toBe(-3)
  })
})

describe('TC-02.1.3 — cell refs in formulas', () => {
  it('resolves refs', () => {
    expect(evalFormula('B2+C2+D2', resolve)).toBe(447)
    expect(evalFormula('B2-C2', resolve)).toBe(-30)
  })
})

describe('TC-02.1.4 — functions over ranges', () => {
  it('SUM/AVERAGE/MIN/MAX/COUNT', () => {
    expect(evalFormula('SUM(B2:D2)', resolve)).toBe(447)
    expect(evalFormula('AVERAGE(B2:D2)', resolve)).toBe(149)
    expect(evalFormula('MIN(B2:D2)', resolve)).toBe(120)
    expect(evalFormula('MAX(B2:D2)', resolve)).toBe(177)
    expect(evalFormula('COUNT(B2:D2)', resolve)).toBe(3)
    expect(evalFormula('SUM(B2:D2)/COUNT(B2:D2)', resolve)).toBe(149)
  })
})

describe('TC-02.1.6 — errors never crash', () => {
  it('division by zero', () => {
    expect(() => evalFormula('1/0', resolve)).toThrow(FormulaError)
    try {
      evalFormula('1/0', resolve)
    } catch (e) {
      expect((e as FormulaError).code).toBe('#DIV/0')
    }
  })
  it('malformed input', () => {
    expect(() => evalFormula('SUM(', resolve)).toThrow(FormulaError)
    expect(() => evalFormula('2+', resolve)).toThrow(FormulaError)
    expect(() => evalFormula('2 3', resolve)).toThrow(FormulaError)
    expect(() => evalFormula('BADFN(1,2)', resolve)).toThrow(FormulaError)
  })
})
