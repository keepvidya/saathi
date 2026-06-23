import { expandRange } from './cell-ref'

/** A formula error is a VALUE (e.g. "#DIV/0"), never an uncaught throw across the boundary. */
export class FormulaError extends Error {
  constructor(public readonly code: string) {
    super(code)
    this.name = 'FormulaError'
  }
}

/** Resolves a cell ref to a number for use inside a formula (text → 0, handled by the caller). */
export type CellResolver = (ref: string) => number

const FUNCS: Record<string, (vals: number[]) => number> = {
  SUM: (v) => v.reduce((a, b) => a + b, 0),
  AVERAGE: (v) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0),
  MIN: (v) => (v.length ? Math.min(...v) : 0),
  MAX: (v) => (v.length ? Math.max(...v) : 0),
  COUNT: (v) => v.length,
}

type Tok = { t: 'num' | 'id' | 'op'; v: string }

function tokenize(s: string): Tok[] {
  const toks: Tok[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === ' ' || c === '\t') {
      i++
    } else if (/[0-9.]/.test(c)) {
      let j = i + 1
      while (j < s.length && /[0-9.]/.test(s[j])) j++
      toks.push({ t: 'num', v: s.slice(i, j) })
      i = j
    } else if (/[A-Za-z]/.test(c)) {
      let j = i + 1
      while (j < s.length && /[A-Za-z0-9]/.test(s[j])) j++
      toks.push({ t: 'id', v: s.slice(i, j) })
      i = j
    } else if ('+-*/(),:'.includes(c)) {
      toks.push({ t: 'op', v: c })
      i++
    } else {
      throw new FormulaError('#ERR')
    }
  }
  return toks
}

/**
 * Evaluate a formula body (without the leading "="). Recursive-descent — no eval/Function.
 * Grammar: expr := term (('+'|'-') term)* ; term := factor (('*'|'/') factor)* ;
 * factor := '-' factor | '(' expr ')' | number | id-primary ;
 * id-primary := FUNC '(' arg (',' arg)* ')' | cellRef ;  arg := ref ':' ref (range) | expr
 */
export function evalFormula(body: string, resolve: CellResolver): number {
  const toks = tokenize(body)
  let p = 0
  const peek = (): Tok | undefined => toks[p]
  const next = (): Tok | undefined => toks[p++]
  const eat = (v: string): void => {
    const t = next()
    if (!t || t.v !== v) throw new FormulaError('#ERR')
  }

  function parseExpr(): number {
    let v = parseTerm()
    let t = peek()
    while (t && (t.v === '+' || t.v === '-')) {
      next()
      const r = parseTerm()
      v = t.v === '+' ? v + r : v - r
      t = peek()
    }
    return v
  }
  function parseTerm(): number {
    let v = parseFactor()
    let t = peek()
    while (t && (t.v === '*' || t.v === '/')) {
      next()
      const r = parseFactor()
      if (t.v === '/') {
        if (r === 0) throw new FormulaError('#DIV/0')
        v /= r
      } else v *= r
      t = peek()
    }
    return v
  }
  function parseFactor(): number {
    const t = peek()
    if (!t) throw new FormulaError('#ERR')
    if (t.v === '-') {
      next()
      return -parseFactor()
    }
    if (t.v === '+') {
      next()
      return parseFactor()
    }
    if (t.v === '(') {
      next()
      const v = parseExpr()
      eat(')')
      return v
    }
    if (t.t === 'num') {
      next()
      const n = parseFloat(t.v)
      if (Number.isNaN(n)) throw new FormulaError('#ERR')
      return n
    }
    if (t.t === 'id') return parseIdPrimary()
    throw new FormulaError('#ERR')
  }
  function parseIdPrimary(): number {
    const id = next()!.v
    if (peek()?.v === '(') {
      next() // '('
      const fn = FUNCS[id.toUpperCase()]
      if (!fn) throw new FormulaError('#ERR')
      const vals: number[] = []
      if (peek() && peek()!.v !== ')') {
        collectArg(vals)
        while (peek()?.v === ',') {
          next()
          collectArg(vals)
        }
      }
      eat(')')
      return fn(vals)
    }
    if (!/^[A-Za-z]+[0-9]+$/.test(id)) throw new FormulaError('#ERR')
    return resolve(id)
  }
  function collectArg(vals: number[]): void {
    const t = peek()
    if (t?.t === 'id' && toks[p + 1]?.v === ':') {
      const a = next()!.v
      next() // ':'
      const b = next()
      if (!b) throw new FormulaError('#ERR')
      for (const ref of expandRange(a, b.v)) vals.push(resolve(ref))
      return
    }
    vals.push(parseExpr())
  }

  const result = parseExpr()
  if (p !== toks.length) throw new FormulaError('#ERR') // trailing tokens
  if (!Number.isFinite(result)) throw new FormulaError('#ERR')
  return Math.round(result * 1e9) / 1e9
}
