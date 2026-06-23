import { evalFormula, FormulaError } from './formula'

/** Serializable spreadsheet state — the DTO that crosses the IPC boundary. */
export interface SheetData {
  cells: Record<string, string>
  rows: number
  cols: number
}

/** A spreadsheet: raw cell contents + a live formula evaluator. Pure (no DOM/IO). */
export class Sheet {
  private readonly cells = new Map<string, string>()

  constructor(
    public rows = 20,
    public cols = 8,
  ) {}

  static from(data: SheetData): Sheet {
    const s = new Sheet(data.rows, data.cols)
    for (const [k, v] of Object.entries(data.cells)) s.cells.set(k.toUpperCase(), v)
    return s
  }

  toData(): SheetData {
    return { cells: Object.fromEntries(this.cells), rows: this.rows, cols: this.cols }
  }

  getRaw(ref: string): string {
    return this.cells.get(ref.toUpperCase()) ?? ''
  }

  setRaw(ref: string, value: string): void {
    const key = ref.toUpperCase()
    if (value === '') this.cells.delete(key)
    else this.cells.set(key, value)
  }

  /** Numeric value of a cell for use inside a formula: text → 0, formula → its number. */
  private numberAt(ref: string, stack: Set<string>): number {
    const v = this.evalRef(ref.toUpperCase(), stack)
    return typeof v === 'number' ? v : 0
  }

  private evalRef(ref: string, stack: Set<string>): number | string {
    if (stack.has(ref)) throw new FormulaError('#CIRC')
    const raw = this.cells.get(ref) ?? ''
    if (raw === '') return 0
    if (raw[0] !== '=') {
      const n = parseFloat(raw)
      return Number.isNaN(n) ? raw : n
    }
    stack.add(ref)
    try {
      return evalFormula(raw.slice(1), (r) => this.numberAt(r, stack))
    } finally {
      stack.delete(ref)
    }
  }

  /** Computed value of a cell: a number, the raw text, or an error code ("#ERR"/"#CIRC"/"#DIV/0"). */
  evaluate(ref: string): number | string {
    try {
      return this.evalRef(ref.toUpperCase(), new Set())
    } catch (e) {
      return e instanceof FormulaError ? e.code : '#ERR'
    }
  }

  /** String to show in the grid cell. */
  display(ref: string): string {
    const raw = this.cells.get(ref.toUpperCase()) ?? ''
    if (raw === '') return ''
    if (raw[0] !== '=') return raw
    return String(this.evaluate(ref))
  }
}

/** The shared M2 fixture: a tiny budget with SUM totals and a profit row. */
export function budgetSheet(): Sheet {
  const s = new Sheet(20, 8)
  const seed: Record<string, string> = {
    A1: 'Item', B1: 'Q1', C1: 'Q2', D1: 'Q3', E1: 'Total',
    A2: 'Sales', B2: '120', C2: '150', D2: '177', E2: '=SUM(B2:D2)',
    A3: 'Costs', B3: '80', C3: '90', D3: '95', E3: '=SUM(B3:D3)',
    A4: 'Profit', B4: '=B2-B3', C4: '=C2-C3', D4: '=D2-D3', E4: '=SUM(B4:D4)',
  }
  for (const [k, v] of Object.entries(seed)) s.setRaw(k, v)
  return s
}
