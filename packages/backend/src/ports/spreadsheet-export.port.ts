import type { SheetData } from '@saathi/domain'

/** Outbound port: turn a sheet into real .xlsx bytes. The domain depends on this interface,
 *  never on a concrete writer. The only vendor type that may appear is in the adapter. */
export interface SpreadsheetExportPort {
  toXlsx(sheet: SheetData): Promise<Uint8Array>
}
