import { afterEach, describe, expect, it, vi } from 'vitest'
import { bridge } from '../src/bridge/saathi.bridge'

afterEach(() => {
  delete (globalThis as Record<string, unknown>).saathi
})

describe('TC-00.1.3 — bridge is minimal & safe', () => {
  it('exposes getAppInfo only (no ipc internals)', () => {
    expect(Object.keys(bridge)).toEqual([
      'getAppInfo',
      'exportXlsx',
      'exportDocx',
      'exportPdf',
      'exportPptx',
      'narrate',
      'chatReply',
      'extractPdfText',
      'runPython',
      'browserPort',
      'memoryControl',
    ])
  })

  it('uses window.saathi when present', async () => {
    const getInfo = vi.fn().mockResolvedValue({ name: 'Saathi', version: '1.2.3', platform: 'win32' })
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo } }
    await expect(bridge.getAppInfo()).resolves.toEqual({
      name: 'Saathi',
      version: '1.2.3',
      platform: 'win32',
    })
    expect(getInfo).toHaveBeenCalledOnce()
  })

  it('falls back gracefully without a preload (standalone browser)', async () => {
    const info = await bridge.getAppInfo()
    expect(info.name).toBe('Saathi')
    expect(info.platform).toBe('web')
  })

  it('exportXlsx uses window.saathi.sheet when present', async () => {
    const exportXlsx = vi.fn().mockResolvedValue({ saved: true, path: 'C:/x.xlsx' })
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, sheet: { exportXlsx } }
    await expect(bridge.exportXlsx({ cells: {}, rows: 1, cols: 1 })).resolves.toEqual({
      saved: true,
      path: 'C:/x.xlsx',
    })
    expect(exportXlsx).toHaveBeenCalledOnce()
  })

  it('exportXlsx falls back to {saved:false} without a host', async () => {
    await expect(bridge.exportXlsx({ cells: {}, rows: 1, cols: 1 })).resolves.toEqual({ saved: false })
  })

  it('exportPptx uses the host when present, else falls back', async () => {
    const exportPptx = vi.fn().mockResolvedValue({ saved: true })
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, slide: { exportPptx } }
    await expect(bridge.exportPptx({ title: 't', slides: [] })).resolves.toEqual({ saved: true })
    delete (globalThis as Record<string, unknown>).saathi
    await expect(bridge.exportPptx({ title: 't', slides: [] })).resolves.toEqual({ saved: false })
  })

  it('exportPdf uses the host when present, else falls back', async () => {
    const exportPdf = vi.fn().mockResolvedValue({ saved: true })
    ;(globalThis as Record<string, unknown>).saathi = {
      app: { getInfo: vi.fn() },
      doc: { exportDocx: vi.fn(), exportPdf },
    }
    await expect(bridge.exportPdf({ blocks: [] })).resolves.toEqual({ saved: true })
    delete (globalThis as Record<string, unknown>).saathi
    await expect(bridge.exportPdf({ blocks: [] })).resolves.toEqual({ saved: false })
  })

  it('narrate returns host lines, or [] without a host', async () => {
    const narrate = vi.fn().mockResolvedValue(['a', 'b'])
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, llm: { narrate } }
    await expect(bridge.narrate({ task: 'x' })).resolves.toEqual(['a', 'b'])
    delete (globalThis as Record<string, unknown>).saathi
    await expect(bridge.narrate({ task: 'x' })).resolves.toEqual([])
  })

  it('chatReply returns host text, or "" without a host', async () => {
    const reply = vi.fn().mockResolvedValue('hi')
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, chat: { reply } }
    await expect(bridge.chatReply([{ role: 'user', content: 'x' }])).resolves.toBe('hi')
    delete (globalThis as Record<string, unknown>).saathi
    await expect(bridge.chatReply([{ role: 'user', content: 'x' }])).resolves.toBe('')
  })

  it('extractPdfText returns host text, or "" without a host', async () => {
    const extractText = vi.fn().mockResolvedValue('pdf words')
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, pdf: { extractText } }
    await expect(bridge.extractPdfText(new Uint8Array([1]))).resolves.toBe('pdf words')
    expect(extractText).toHaveBeenCalledOnce()
    delete (globalThis as Record<string, unknown>).saathi
    await expect(bridge.extractPdfText(new Uint8Array([1]))).resolves.toBe('')
  })

  it('runPython delegates to the host, or reports it needs the app', async () => {
    const run = vi.fn().mockResolvedValue({ ok: true, output: '5' })
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, py: { run } }
    await expect(bridge.runPython('print(5)')).resolves.toEqual({ ok: true, output: '5' })
    expect(run).toHaveBeenCalledWith('print(5)')
    delete (globalThis as Record<string, unknown>).saathi
    const fallback = await bridge.runPython('print(5)')
    expect(fallback.ok).toBe(false)
    expect(fallback.output.toLowerCase()).toContain('desktop app')
  })

  it('browserPort uses the host when present, else a safe no-op port', async () => {
    const hostBrowser = { newTab: vi.fn().mockResolvedValue({ tabs: [], activeId: undefined }) }
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, browser: hostBrowser }
    expect(bridge.browserPort()).toBe(hostBrowser)

    delete (globalThis as Record<string, unknown>).saathi
    const noopMem = bridge.memoryControl()
    await expect(noopMem.remember('x')).resolves.toBeNull()
    await expect(Promise.all([noopMem.recall('x'), noopMem.list(), noopMem.forget('x')])).resolves.toHaveLength(3)
    delete (globalThis as Record<string, unknown>).saathi
    const noop = bridge.browserPort()
    await expect(noop.newTab()).resolves.toEqual({
      tabs: [],
      activeId: undefined,
      shields: { enabled: true, blocked: 0 },
    })
    expect(noop.onEvent(() => {})).toBeTypeOf('function') // returns an unsubscribe
    // every no-op method resolves without a host (no throws)
    await expect(
      Promise.all([
        noop.closeTab(1),
        noop.activate(1),
        noop.navigate(1, 'x'),
        noop.back(1),
        noop.forward(1),
        noop.reload(1),
        noop.setBounds({ x: 0, y: 0, width: 0, height: 0 }),
        noop.setVisible(true),
        noop.toggleShields(),
      ]),
    ).resolves.toHaveLength(9)
  })
})
