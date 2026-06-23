import { describe, expect, it, vi } from 'vitest'
import { WINDOW_SECURITY } from '../src/main/security'
import { buildApi } from '../src/preload/build-api'
import { IPC } from '@saathi/shared'

describe('TC-00.2.1 — secure webPreferences + preload contract', () => {
  it('window security baseline is locked down', () => {
    expect(WINDOW_SECURITY).toMatchObject({
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    })
  })

  it('preload exposes one method per channel and never raw ipc', () => {
    const invoke = vi.fn().mockResolvedValue({ name: 'Saathi', version: '0.1.0', platform: 'win32' })
    const api = buildApi(invoke)

    expect(Object.keys(api)).toEqual(['app', 'sheet', 'doc', 'slide', 'llm', 'chat'])
    expect(Object.keys(api.app)).toEqual(['getInfo'])
    expect(Object.keys(api.sheet)).toEqual(['exportXlsx'])
    expect(Object.keys(api.doc)).toEqual(['exportDocx', 'exportPdf'])
    expect(Object.keys(api.slide)).toEqual(['exportPptx'])
    expect(Object.keys(api.chat)).toEqual(['reply'])
    expect(Object.keys(api.llm)).toEqual(['narrate'])

    void api.app.getInfo()
    expect(invoke).toHaveBeenCalledWith(IPC.appGetInfo)
    void api.sheet.exportXlsx({ cells: {}, rows: 1, cols: 1 })
    expect(invoke).toHaveBeenCalledWith(IPC.sheetExportXlsx, { cells: {}, rows: 1, cols: 1 })
    expect((api as Record<string, unknown>).ipcRenderer).toBeUndefined()
  })
})
