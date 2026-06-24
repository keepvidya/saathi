import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderOnboarding } from '../src/onboarding/onboarding'
import type { SettingsControl } from '../src/bridge/saathi.bridge'
import { SECRET_LLM, defaultSettings, type AppSettings } from '@saathi/shared'

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

function makeStub() {
  const state: AppSettings = defaultSettings()
  const secrets: Record<string, string> = {}
  const control: SettingsControl = {
    get: vi.fn(async () => state),
    set: vi.fn(async (p: Partial<AppSettings>) => Object.assign(state, p)),
    hasSecret: vi.fn(async (n: string) => !!secrets[n]),
    setSecret: vi.fn(async (n: string, v: string) => {
      secrets[n] = v
    }),
    clearSecret: vi.fn(async () => {}),
  }
  return { control, state, secrets }
}

describe('TC-21.2 — onboarding wizard', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
  })

  const click = (id: string): void => host.querySelector<HTMLButtonElement>(id)!.click()

  it('walks name → offline → none → finish; saves settings + onboarded; calls onDone', async () => {
    const { control } = makeStub()
    const onDone = vi.fn()
    renderOnboarding(host, { settings: control, onDone })

    // step 0 — name
    const name = host.querySelector<HTMLInputElement>('#onb-name')!
    name.value = 'Gunjan'
    name.dispatchEvent(new Event('input', { bubbles: true }))
    click('#onb-primary') // → step 1 (offline default)
    click('#onb-primary') // → step 2 (none default)
    click('#onb-primary') // → step 3 (finish view)
    expect(host.querySelector('.onb-h')?.textContent).toContain('Gunjan')
    click('#onb-primary') // Finish
    await flush()

    expect(control.set).toHaveBeenCalledWith(
      expect.objectContaining({ userName: 'Gunjan', llmMode: 'offline', onboarded: true }),
    )
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('cloud path reveals the key field and stores the key encrypted', async () => {
    const { control } = makeStub()
    renderOnboarding(host, { settings: control, onDone: vi.fn() })

    click('#onb-primary') // → step 1
    const cloud = host.querySelector<HTMLInputElement>('input[name="onb-llm"][value="cloud"]')!
    cloud.checked = true
    cloud.dispatchEvent(new Event('change', { bubbles: true }))
    expect(host.querySelector<HTMLElement>('#onb-llm-key')!.hidden).toBe(false)
    const key = host.querySelector<HTMLInputElement>('#onb-llm-input')!
    key.value = 'sk-live-123'
    key.dispatchEvent(new Event('input', { bubbles: true }))

    click('#onb-primary') // → step 2
    click('#onb-primary') // → step 3
    click('#onb-primary') // Finish
    await flush()

    expect(control.set).toHaveBeenCalledWith(expect.objectContaining({ llmMode: 'cloud', onboarded: true }))
    expect(control.setSecret).toHaveBeenCalledWith(SECRET_LLM, 'sk-live-123')
  })

  it('Back returns to the previous step', () => {
    renderOnboarding(host, { settings: makeStub().control, onDone: vi.fn() })
    click('#onb-primary') // step 1
    expect(host.querySelector('.onb-h')?.textContent).toContain('How should I think')
    click('#onb-back') // step 0
    expect(host.querySelector('#onb-name')).toBeTruthy()
  })
})
