import ExcelJS from 'exceljs'
import { Sheet, parseRef, type SheetData } from '@saathi/domain'
import type { SpreadsheetExportPort } from '../../ports/spreadsheet-export.port'

/**
 * The ONLY file allowed to import ExcelJS (Wrapper Rule). Translates our SheetData into a real
 * .xlsx: numbers as numbers, formulas as `{formula, result}` (so the file is correct AND live in
 * Excel), header row frozen. Vendor types never leak past this class.
 */
export class ExcelJsSpreadsheetExport implements SpreadsheetExportPort {
  async toXlsx(data: SheetData): Promise<Uint8Array> {
    const sheet = Sheet.from(data)
    const wb = new ExcelJS.Workbook()
    wb.creator = 'Saathi'
    const ws = wb.addWorksheet('Sheet1', { views: [{ state: 'frozen', ySplit: 1 }] })

    for (const [ref, raw] of Object.entries(data.cells)) {
      const { col, row } = parseRef(ref)
      const cell = ws.getCell(row, col + 1) // ExcelJS columns are 1-based
      if (raw.startsWith('=')) {
        const result = sheet.evaluate(ref)
        cell.value = {
          formula: raw.slice(1),
          result: typeof result === 'number' ? result : 0,
        } as ExcelJS.CellFormulaValue
      } else {
        const n = Number(raw)
        cell.value = !Number.isNaN(n) && raw.trim() !== '' && String(n) === raw.trim() ? n : raw
      }
    }

    const buf = await wb.xlsx.writeBuffer()
    return new Uint8Array(buf as ArrayBuffer)
  }
}
