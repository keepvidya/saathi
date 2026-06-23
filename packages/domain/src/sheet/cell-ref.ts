/** A1-style cell reference as a value object. col is 0-based (A=0); row is 1-based. */
export interface CellRef {
  col: number
  row: number
}

const REF_RE = /^([A-Za-z]+)(\d+)$/

/** "B2" → { col:1, row:2 }. Throws on a malformed ref. */
export function parseRef(ref: string): CellRef {
  const m = REF_RE.exec(ref.trim())
  if (!m) throw new Error(`bad cell ref: ${ref}`)
  let col = 0
  for (const ch of m[1].toUpperCase()) col = col * 26 + (ch.charCodeAt(0) - 64)
  return { col: col - 1, row: parseInt(m[2], 10) }
}

/** 0-based column index → letters. 0 → "A", 26 → "AA". */
export function colName(col: number): string {
  let n = col + 1
  let s = ''
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

/** { col:4, row:1 } → "E1". */
export function formatRef(c: CellRef): string {
  return colName(c.col) + c.row
}

/** "B2","D2" → ["B2","C2","D2"] (rectangle, any corner order). */
export function expandRange(a: string, b: string): string[] {
  const ra = parseRef(a)
  const rb = parseRef(b)
  const c0 = Math.min(ra.col, rb.col)
  const c1 = Math.max(ra.col, rb.col)
  const r0 = Math.min(ra.row, rb.row)
  const r1 = Math.max(ra.row, rb.row)
  const out: string[] = []
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) out.push(colName(c) + r)
  return out
}
