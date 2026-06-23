import { describe, expect, it } from 'vitest'
import ExcelJS from 'exceljs'
import { budgetSheet, Sheet } from '@saathi/domain'
import { ExcelJsSpreadsheetExport } from '../src/adapters/exceljs/exceljs-export.adapter'

describe('TC-02.2.1 — ExcelJS export round-trips', () => {
  it('exports a valid .xlsx whose values + computed total survive a re-read', async () => {
    const exporter = new ExcelJsSpreadsheetExport()
    const bytes = await exporter.toXlsx(budgetSheet().toData())
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(bytes.byteLength).toBeGreaterThan(0)

    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(bytes.buffer as ArrayBuffer)
    const ws = wb.getWorksheet('Sheet1')!

    expect(ws.getCell('A1').value).toBe('Item')
    expect(ws.getCell('B2').value).toBe(120)

    // E2 is a formula cell: it carries the formula AND the computed result (447).
    const e2 = ws.getCell('E2').value as ExcelJS.CellFormulaValue
    expect(e2.formula).toBe('SUM(B2:D2)')
    expect(e2.result).toBe(447)

    // Header row is frozen.
    expect(ws.views[0]).toMatchObject({ state: 'frozen', ySplit: 1 })
  })

  it('writes error-formula cells without throwing (result falls back to 0)', async () => {
    const s = new Sheet(5, 5)
    s.setRaw('A1', 'Label')
    s.setRaw('A2', '=1/0') // evaluates to #DIV/0 (non-number) → result 0 in the xlsx
    const bytes = await new ExcelJsSpreadsheetExport().toXlsx(s.toData())
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(bytes.buffer as ArrayBuffer)
    const a2 = wb.getWorksheet('Sheet1')!.getCell('A2').value as ExcelJS.CellFormulaValue
    expect(a2.formula).toBe('1/0') // exported without throwing (result-fallback branch exercised)
  })
})
