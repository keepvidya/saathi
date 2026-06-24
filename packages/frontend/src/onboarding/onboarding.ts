import { SECRET_LLM, SECRET_SEARCH, type AppSettings } from '@saathi/shared'
import { bridge, type SettingsControl } from '../bridge/saathi.bridge'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

export interface OnboardingOptions {
  settings?: SettingsControl
  onDone: () => void
}

const STEPS = 4

/**
 * First-run onboarding — a short, branded wizard: your name → how it thinks
 * (offline Ollama/Shiva or cloud BYOK) → web search → done. Writes settings +
 * encrypted keys, then hands off to the app.
 */
export function renderOnboarding(host: HTMLElement, opts: OnboardingOptions): void {
  const ctrl = opts.settings ?? bridge.settingsControl()
  const draft: Pick<AppSettings, 'userName' | 'llmMode' | 'cloudProvider' | 'searchProvider'> = {
    userName: '',
    llmMode: 'offline',
    cloudProvider: 'openai',
    searchProvider: 'none',
  }
  const keys: Record<string, string> = { [SECRET_LLM]: '', [SECRET_SEARCH]: '' }
  let step = 0

  host.innerHTML = `<div class="onb" data-onboarding>
    <div class="onb-card">
      <div class="onb-brand"><span class="onb-mark">◆</span> Saathi</div>
      <div class="onb-body" id="onb-body"></div>
      <div class="onb-foot">
        <div class="onb-dots" id="onb-dots"></div>
        <div class="onb-nav">
          <button class="onb-btn ghost" id="onb-back">Back</button>
          <button class="onb-btn primary" id="onb-primary">Next</button>
        </div>
      </div>
    </div>
  </div>`

  const body = host.querySelector<HTMLElement>('#onb-body')!
  const back = host.querySelector<HTMLButtonElement>('#onb-back')!
  const primary = host.querySelector<HTMLButtonElement>('#onb-primary')!
  const dots = host.querySelector<HTMLElement>('#onb-dots')!

  const stepBody = (): string => {
    const name = draft.userName.trim()
    if (step === 0)
      return `<h2 class="onb-h">Hi — I'm Saathi.</h2>
        <p class="onb-p">Your private, on-device workspace. First — what should I call you?</p>
        <input id="onb-name" class="onb-input" placeholder="Your name" value="${esc(draft.userName)}" />`
    if (step === 1)
      return `<h2 class="onb-h">How should I think${name ? `, ${esc(name)}` : ''}?</h2>
        <p class="onb-p">Pick where the AI runs. You can change this later in Settings.</p>
        <label class="onb-opt"><input type="radio" name="onb-llm" value="offline" ${draft.llmMode === 'offline' ? 'checked' : ''}> <b>Offline</b> — local Ollama + Shiva, fully private (recommended)</label>
        <label class="onb-opt"><input type="radio" name="onb-llm" value="cloud" ${draft.llmMode === 'cloud' ? 'checked' : ''}> <b>Cloud (BYOK)</b> — use your own provider key</label>
        <div id="onb-llm-key" ${draft.llmMode === 'cloud' ? '' : 'hidden'}>
          <select id="onb-cloud" class="onb-input"><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option></select>
          <input id="onb-llm-input" type="password" class="onb-input" placeholder="API key (optional now)" value="${esc(keys[SECRET_LLM])}" /></div>`
    if (step === 2)
      return `<h2 class="onb-h">Search the web?</h2>
        <p class="onb-p">Optional. Choose a provider and paste its key (or skip).</p>
        <label class="onb-opt"><input type="radio" name="onb-search" value="none" ${draft.searchProvider === 'none' ? 'checked' : ''}> None</label>
        <label class="onb-opt"><input type="radio" name="onb-search" value="serper" ${draft.searchProvider === 'serper' ? 'checked' : ''}> Serper</label>
        <label class="onb-opt"><input type="radio" name="onb-search" value="brave" ${draft.searchProvider === 'brave' ? 'checked' : ''}> Brave</label>
        <div id="onb-search-key" ${draft.searchProvider === 'none' ? 'hidden' : ''}>
          <input id="onb-search-input" type="password" class="onb-input" placeholder="Search API key (optional now)" value="${esc(keys[SECRET_SEARCH])}" /></div>`
    return `<h2 class="onb-h">You're all set${name ? `, ${esc(name)}` : ''}.</h2>
      <p class="onb-p">Everything runs on your machine. Chat, Office, Knowledge, Learn, a private Browser, an Agent, Memory and Skills — all yours.</p>`
  }

  const wireStep = (): void => {
    const name = body.querySelector<HTMLInputElement>('#onb-name')
    name?.addEventListener('input', () => (draft.userName = name.value))
    body.querySelectorAll<HTMLInputElement>('input[name="onb-llm"]').forEach((r) =>
      r.addEventListener('change', () => {
        if (r.checked) draft.llmMode = r.value as AppSettings['llmMode']
        body.querySelector<HTMLElement>('#onb-llm-key')!.hidden = draft.llmMode !== 'cloud'
      }),
    )
    body.querySelector<HTMLSelectElement>('#onb-cloud')?.addEventListener('change', (e) => {
      draft.cloudProvider = (e.target as HTMLSelectElement).value
    })
    body.querySelector<HTMLInputElement>('#onb-llm-input')?.addEventListener('input', (e) => {
      keys[SECRET_LLM] = (e.target as HTMLInputElement).value
    })
    body.querySelectorAll<HTMLInputElement>('input[name="onb-search"]').forEach((r) =>
      r.addEventListener('change', () => {
        if (r.checked) draft.searchProvider = r.value as AppSettings['searchProvider']
        body.querySelector<HTMLElement>('#onb-search-key')!.hidden = draft.searchProvider === 'none'
      }),
    )
    body.querySelector<HTMLInputElement>('#onb-search-input')?.addEventListener('input', (e) => {
      keys[SECRET_SEARCH] = (e.target as HTMLInputElement).value
    })
  }

  const draw = (): void => {
    body.innerHTML = stepBody()
    wireStep()
    dots.innerHTML = Array.from({ length: STEPS }, (_, i) => `<span class="onb-dot${i === step ? ' on' : ''}"></span>`).join('')
    back.style.visibility = step === 0 ? 'hidden' : 'visible'
    primary.textContent = step === STEPS - 1 ? 'Finish' : 'Next'
  }

  async function finish(): Promise<void> {
    primary.disabled = true
    await ctrl.set({ ...draft, onboarded: true })
    for (const [name, value] of Object.entries(keys)) {
      if (value.trim()) await ctrl.setSecret(name, value.trim())
    }
    opts.onDone()
  }

  back.addEventListener('click', () => {
    if (step > 0) {
      step--
      draw()
    }
  })
  primary.addEventListener('click', () => {
    if (step < STEPS - 1) {
      step++
      draw()
    } else {
      void finish()
    }
  })

  draw()
}
