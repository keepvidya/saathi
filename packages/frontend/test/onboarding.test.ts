import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderOnboarding } from '../src/onboarding/onboarding'
import type { SettingsControl, SetupControl } from '../src/bridge/saathi.bridge'
import { SECRET_LLM, defaultSettings, type AppSettings } from '@saathi/shared'

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

function makeSettings() {
  const state: AppSettings = defaultSettings()
  const secrets: Record<string, string> = {}
  const control: SettingsControl = {
    get: vi.fn(async () => state),
    set: vi.fn(async (p: Partial<AppSettings>) => Object.assign(state, p)),
    hasSecret: vi.fn(async () => false),
    setSecret: vi.fn(async (n: string, v: string) => {
      secrets[n] = v
    }),
    clearSecret: vi.fn(async () => {}),
  }
  return control
}

function makeSetup(recommend: 'ultra' | 'lite' = 'lite') {
  const control: SetupControl = {
    hardware: vi.fn(async () => ({ totalMemGB: 16, cores: 8, recommend })),
    ollamaStatus: vi.fn(async () => ({ installed: false, running: false, models: [] })),
    ollamaSetup: vi.fn(async () => {}),
    onSetupProgress: vi.fn(() => () => {}),
  }
  return control
}

describe('TC-21.2 — onboarding wizard (hardware + Shiva setup)', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
  })
  const click = (id: string): void => host.querySelector<HTMLButtonElement>(id)!.click()

  it('shows the hardware check + recommended mode', async () => {
    renderOnboarding(host, { settings: makeSettings(), setup: makeSetup('lite'), onDone: vi.fn() })
    await flush()
    click('#onb-primary') // → mode step
    expect(host.querySelector('.onb-p')?.textContent).toContain('16 GB RAM')
    expect(host.querySelector('.onb-opt.mode[data-mode="lite"] .onb-rec')?.textContent).toContain('Recommended')
  })

  it('offline path: name → Lite → embedding → pulls Shiva → finishes', async () => {
    const settings = makeSettings()
    const setup = makeSetup('lite')
    const onDone = vi.fn()
    renderOnboarding(host, { settings, setup, onDone })
    await flush()

    const name = host.querySelector<HTMLInputElement>('#onb-name')!
    name.value = 'Gunjan'
    name.dispatchEvent(new Event('input', { bubbles: true }))
    click('#onb-primary') // → mode (Lite recommended/selected)
    click('#onb-primary') // → embedding
    click('#onb-primary') // → setup (offline) — triggers ollamaSetup
    await flush()
    expect(setup.ollamaSetup).toHaveBeenCalledWith('shiva-chat:7b')

    click('#onb-primary') // Enter Saathi
    await flush()
    expect(settings.set).toHaveBeenCalledWith(
      expect.objectContaining({ userName: 'Gunjan', runMode: 'lite', llmMode: 'offline', onboarded: true }),
    )
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('heavy path: choose Heavy → key step → stores the cloud key', async () => {
    const settings = makeSettings()
    const onDone = vi.fn()
    renderOnboarding(host, { settings, setup: makeSetup('lite'), onDone })
    await flush()

    click('#onb-primary') // → mode
    const heavy = host.querySelector<HTMLInputElement>('input[name="onb-mode"][value="heavy"]')!
    heavy.checked = true
    heavy.dispatchEvent(new Event('change', { bubbles: true }))
    click('#onb-primary') // → embedding
    click('#onb-primary') // → key step (heavy)

    const key = host.querySelector<HTMLInputElement>('#onb-key')!
    key.value = 'sk-cloud-1'
    key.dispatchEvent(new Event('input', { bubbles: true }))
    click('#onb-primary') // Finish
    await flush()

    expect(settings.set).toHaveBeenCalledWith(expect.objectContaining({ runMode: 'heavy', llmMode: 'cloud', onboarded: true }))
    expect(settings.setSecret).toHaveBeenCalledWith(SECRET_LLM, 'sk-cloud-1')
    expect(onDone).toHaveBeenCalledOnce()
  })
})
