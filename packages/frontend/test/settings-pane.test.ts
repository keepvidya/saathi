import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderSettings } from '../src/panes/settings/settings-pane'
import type { SettingsControl } from '../src/bridge/saathi.bridge'
import { SECRET_LLM, defaultSettings, type AppSettings } from '@saathi/shared'

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

function makeStub(over: Partial<AppSettings> = {}, secrets: Record<string, boolean> = {}) {
  const state: AppSettings = { ...defaultSettings(), ...over }
  const sec = { ...secrets }
  const control: SettingsControl = {
    get: vi.fn(async () => state),
    set: vi.fn(async (p: Partial<AppSettings>) => Object.assign(state, p)),
    hasSecret: vi.fn(async (n: string) => !!sec[n]),
    setSecret: vi.fn(async (n: string) => {
      sec[n] = true
    }),
    clearSecret: vi.fn(async (n: string) => {
      sec[n] = false
    }),
  }
  return control
}

describe('TC-20.2 — Settings pane', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
  })

  it('TC-20.2.1 — loads settings; changing the name + provider saves', async () => {
    const ctrl = makeStub({ userName: 'Gunjan', llmMode: 'offline' })
    renderSettings(host, { settings: ctrl })
    await flush()
    expect(host.querySelector<HTMLInputElement>('#set-name')!.value).toBe('Gunjan')

    const name = host.querySelector<HTMLInputElement>('#set-name')!
    name.value = 'Tailor'
    name.dispatchEvent(new Event('change', { bubbles: true }))
    expect(ctrl.set).toHaveBeenCalledWith({ userName: 'Tailor' })

    // choose cloud → the key field appears
    const cloud = host.querySelector<HTMLInputElement>('#set-llm input[value="cloud"]')!
    cloud.checked = true
    cloud.dispatchEvent(new Event('change', { bubbles: true }))
    expect(ctrl.set).toHaveBeenCalledWith({ llmMode: 'cloud' })
    expect(host.querySelector<HTMLElement>('#set-llm-key')!.hidden).toBe(false)
  })

  it('TC-20.2.2 — keys: save sets, presence shows, never displays the value', async () => {
    const ctrl = makeStub({ llmMode: 'cloud' })
    renderSettings(host, { settings: ctrl })
    await flush()

    const box = host.querySelector<HTMLElement>(`.set-key[data-key="${SECRET_LLM}"]`)!
    expect(box.querySelector('[data-status]')!.textContent).toBe('Not set')

    const input = box.querySelector<HTMLInputElement>('.set-key-input')!
    input.value = 'sk-secret-123'
    box.querySelector<HTMLButtonElement>('.set-key-save')!.click()
    await flush()
    expect(ctrl.setSecret).toHaveBeenCalledWith(SECRET_LLM, 'sk-secret-123')
    expect(box.querySelector('[data-status]')!.textContent).toContain('Set')
    expect(input.value).toBe('') // cleared; the value is never re-rendered
    expect(box.textContent).not.toContain('sk-secret-123')

    box.querySelector<HTMLButtonElement>('.set-key-remove')!.click()
    await flush()
    expect(ctrl.clearSecret).toHaveBeenCalledWith(SECRET_LLM)
    expect(box.querySelector('[data-status]')!.textContent).toBe('Not set')
  })

  it('shows a key as already set on load (presence only)', async () => {
    const ctrl = makeStub({ llmMode: 'cloud' }, { [SECRET_LLM]: true })
    renderSettings(host, { settings: ctrl })
    await flush()
    const box = host.querySelector<HTMLElement>(`.set-key[data-key="${SECRET_LLM}"]`)!
    expect(box.querySelector('[data-status]')!.textContent).toContain('Set')
    expect(box.querySelector<HTMLElement>('.set-key-remove')!.hidden).toBe(false)
  })
})
