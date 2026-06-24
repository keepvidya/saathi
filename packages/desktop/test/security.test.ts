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

    expect(Object.keys(api)).toEqual([
      'app',
      'sheet',
      'doc',
      'slide',
      'llm',
      'chat',
      'pdf',
      'py',
      'browser',
      'memory',
      'settings',
      'secrets',
    ])
    expect(Object.keys(api.app)).toEqual(['getInfo', 'firstRun'])
    expect(Object.keys(api.sheet)).toEqual(['exportXlsx'])
    expect(Object.keys(api.doc)).toEqual(['exportDocx', 'exportPdf'])
    expect(Object.keys(api.slide)).toEqual(['exportPptx'])
    expect(Object.keys(api.chat)).toEqual(['reply'])
    expect(Object.keys(api.llm)).toEqual(['narrate'])
    expect(Object.keys(api.pdf)).toEqual(['extractText'])
    expect(Object.keys(api.py)).toEqual(['run'])
    expect(Object.keys(api.browser)).toEqual([
      'newTab',
      'closeTab',
      'activate',
      'navigate',
      'back',
      'forward',
      'reload',
      'setBounds',
      'setVisible',
      'toggleShields',
      'onEvent',
    ])
    expect(Object.keys(api.memory)).toEqual(['remember', 'recall', 'list', 'forget'])
    expect(Object.keys(api.settings)).toEqual(['get', 'set'])
    expect(Object.keys(api.secrets)).toEqual(['set', 'has', 'clear']) // no `get` — keys stay in main

    // Exercise every method → each maps to its channel, and never leaks raw ipc.
    void api.app.getInfo()
    void api.app.firstRun()
    expect(invoke).toHaveBeenCalledWith(IPC.appGetInfo)
    expect(invoke).toHaveBeenCalledWith(IPC.appFirstRun)
    void api.sheet.exportXlsx({ cells: {}, rows: 1, cols: 1 })
    expect(invoke).toHaveBeenCalledWith(IPC.sheetExportXlsx, { cells: {}, rows: 1, cols: 1 })
    void api.doc.exportDocx({ blocks: [] })
    void api.doc.exportPdf({ blocks: [] })
    void api.slide.exportPptx({ title: 't', slides: [] })
    void api.llm.narrate({ task: 'x' })
    void api.chat.reply([])
    void api.pdf.extractText(new Uint8Array())
    void api.py.run('print(1)')
    void api.browser.newTab('x')
    void api.browser.closeTab(1)
    void api.browser.activate(1)
    void api.browser.navigate(1, 'x')
    void api.browser.back(1)
    void api.browser.forward(1)
    void api.browser.reload(1)
    void api.browser.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    void api.browser.setVisible(true)
    void api.browser.toggleShields()
    void api.memory.remember('note')
    void api.memory.recall('q', 5)
    void api.memory.list()
    void api.memory.forget('id')
    void api.settings.get()
    void api.settings.set({ userName: 'G' })
    void api.secrets.set('k', 'v')
    void api.secrets.has('k')
    void api.secrets.clear('k')
    expect(invoke).toHaveBeenCalledWith(IPC.browserNavigate, 1, 'x')
    expect(invoke).toHaveBeenCalledWith(IPC.browserToggleShields)
    expect(invoke).toHaveBeenCalledWith(IPC.memoryRemember, 'note')
    expect(invoke).toHaveBeenCalledWith(IPC.secretSet, 'k', 'v')
    // the renderer surface must NOT expose a way to read a secret back
    expect((api.secrets as Record<string, unknown>).get).toBeUndefined()

    // onEvent uses the push channel (defaults to a no-op unsubscribe in tests)
    expect(api.browser.onEvent(() => {})).toBeTypeOf('function')

    expect((api as Record<string, unknown>).ipcRenderer).toBeUndefined()
  })
})
