import {
  SECRET_LLM,
  SHIVA_MODELS,
  type AppSettings,
  type RunMode,
  type HardwareInfo,
  type SetupProgress,
} from '@saathi/shared'
import { bridge, type SettingsControl, type SetupControl } from '../bridge/saathi.bridge'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

export interface OnboardingOptions {
  settings?: SettingsControl
  setup?: SetupControl
  onDone: () => void
}

const MODES: { id: RunMode; icon: string; name: string; tag: string; blurb: string }[] = [
  { id: 'ultra', icon: '⚡', name: 'Ultra-Lite', tag: '1.5B', blurb: 'Fastest. English only, fully offline.' },
  { id: 'lite', icon: '🪶', name: 'Lite', tag: '7B', blurb: 'Smarter, still 100% on your machine.' },
  { id: 'heavy', icon: '☁️', name: 'Heavy', tag: 'your key', blurb: 'A big cloud model with your own key, for the hardest work.' },
]

/**
 * First-run onboarding (the locked design): name → how it should think (Lite /
 * Ultra-Lite / Heavy, recommended from your machine's RAM) → where search runs.
 * For offline modes it pulls the matching Shiva model — installing Ollama first
 * if it's missing. The installer bundles neither.
 */
export function renderOnboarding(host: HTMLElement, opts: OnboardingOptions): void {
  const settings = opts.settings ?? bridge.settingsControl()
  const setup = opts.setup ?? bridge.setupControl()
  const draft = { userName: '', mode: 'lite' as RunMode, embedding: 'local' as AppSettings['embedding'] }
  let llmKey = ''
  let hw: HardwareInfo | null = null
  let step = 0

  host.innerHTML = `<div class="onb" data-onboarding>
    <div class="onb-card">
      <div class="onb-brand"><span class="onb-mark">◆</span> Saathi</div>
      <div class="onb-body" id="onb-body"></div>
      <div class="onb-foot">
        <div class="onb-dots" id="onb-dots"></div>
        <div class="onb-nav">
          <button class="onb-btn ghost" id="onb-back">Back</button>
          <button class="onb-btn primary" id="onb-primary">Continue</button>
        </div>
      </div>
    </div>
  </div>`

  const body = host.querySelector<HTMLElement>('#onb-body')!
  const back = host.querySelector<HTMLButtonElement>('#onb-back')!
  const primary = host.querySelector<HTMLButtonElement>('#onb-primary')!
  const dots = host.querySelector<HTMLElement>('#onb-dots')!

  const modeCard = (m: (typeof MODES)[number]): string =>
    `<label class="onb-opt mode" data-mode="${m.id}">
      <input type="radio" name="onb-mode" value="${m.id}" ${draft.mode === m.id ? 'checked' : ''}>
      <span class="onb-mi">${m.icon}</span>
      <span><b>${m.name}</b> <span class="onb-tag">· ${m.tag}</span>${hw && hw.recommend === m.id ? '<span class="onb-rec">Recommended</span>' : ''}
        <span class="onb-blurb">${m.blurb}</span></span>
    </label>`

  const stepBody = (): string => {
    const name = draft.userName.trim()
    if (step === 0)
      return `<h2 class="onb-h">Hello — I'm Saathi.</h2>
        <p class="onb-p">Your private AI workspace that runs on your own computer. What should I call you?</p>
        <input id="onb-name" class="onb-input" placeholder="Your name" value="${esc(draft.userName)}" />`
    if (step === 1) {
      const ram = hw ? `It checked your computer (${hw.totalMemGB} GB RAM) — ${hw.recommend === 'ultra' ? 'Ultra-Lite' : 'Lite'} fits well.` : 'Checking your computer…'
      return `<h2 class="onb-h">Nice to meet you${name ? `, ${esc(name)}` : ''}.</h2>
        <p class="onb-p">Pick how Saathi should think. ${esc(ram)}</p>
        ${MODES.map(modeCard).join('')}`
    }
    if (step === 2)
      return `<h2 class="onb-h">One last thing.</h2>
        <p class="onb-p">So Saathi can search your documents, it reads them once. Where should that happen?</p>
        <label class="onb-opt" data-emb="local"><input type="radio" name="onb-emb" value="local" ${draft.embedding === 'local' ? 'checked' : ''}> <span><b>On my computer</b> <span class="onb-rec">Private</span><span class="onb-blurb">Fully offline. Nothing leaves your machine.</span></span></label>
        <label class="onb-opt" data-emb="cloud"><input type="radio" name="onb-emb" value="cloud" ${draft.embedding === 'cloud' ? 'checked' : ''}> <span><b>Faster, with my key</b><span class="onb-blurb">Slightly faster search with your cloud key.</span></span></label>`
    // step 3 — finishing
    if (draft.mode === 'heavy')
      return `<h2 class="onb-h">Your cloud key</h2>
        <p class="onb-p">Heavy mode uses your own provider. Paste a key now, or add it later in Settings.</p>
        <input id="onb-key" type="password" class="onb-input" placeholder="API key (optional)" value="${esc(llmKey)}" />`
    return `<h2 class="onb-h">Setting up your private AI…</h2>
      <p class="onb-p">Getting <b>${esc(SHIVA_MODELS[draft.mode as 'ultra' | 'lite'])}</b> ready on your machine. This is a one-time download; you can continue while it finishes.</p>
      <div class="onb-prog"><div class="onb-prog-bar" id="onb-prog-bar"></div></div>
      <div class="onb-prog-msg" id="onb-prog-msg">Checking for Ollama…</div>`
  }

  const wireStep = (): void => {
    const name = body.querySelector<HTMLInputElement>('#onb-name')
    name?.addEventListener('input', () => (draft.userName = name.value))
    body.querySelectorAll<HTMLInputElement>('input[name="onb-mode"]').forEach((r) =>
      r.addEventListener('change', () => {
        if (r.checked) draft.mode = r.value as RunMode
      }),
    )
    body.querySelectorAll<HTMLInputElement>('input[name="onb-emb"]').forEach((r) =>
      r.addEventListener('change', () => {
        if (r.checked) draft.embedding = r.value as AppSettings['embedding']
      }),
    )
    body.querySelector<HTMLInputElement>('#onb-key')?.addEventListener('input', (e) => {
      llmKey = (e.target as HTMLInputElement).value
    })
  }

  const draw = (): void => {
    body.innerHTML = stepBody()
    wireStep()
    dots.innerHTML = [0, 1, 2, 3].map((i) => `<span class="onb-dot${i === step ? ' on' : ''}"></span>`).join('')
    back.style.visibility = step === 0 ? 'hidden' : 'visible'
    primary.textContent = step < 2 ? 'Continue' : step === 2 ? 'Set it up' : draft.mode === 'heavy' ? 'Finish' : 'Enter Saathi'
    if (step === 3 && draft.mode !== 'heavy') startSetup()
  }

  let unsub: (() => void) | undefined
  const startSetup = (): void => {
    const model = SHIVA_MODELS[draft.mode as 'ultra' | 'lite']
    const bar = body.querySelector<HTMLElement>('#onb-prog-bar')
    const msg = body.querySelector<HTMLElement>('#onb-prog-msg')
    unsub?.()
    unsub = setup.onSetupProgress((p: SetupProgress) => {
      if (msg) msg.textContent = p.message
      if (bar && p.percent != null) bar.style.width = `${p.percent}%`
      if (p.phase === 'done' && bar) bar.style.width = '100%'
    })
    void setup.ollamaSetup(model)
  }

  async function finish(): Promise<void> {
    await settings.set({
      userName: draft.userName.trim(),
      runMode: draft.mode,
      llmMode: draft.mode === 'heavy' ? 'cloud' : 'offline',
      embedding: draft.embedding,
      onboarded: true,
    })
    if (draft.mode === 'heavy' && llmKey.trim()) await settings.setSecret(SECRET_LLM, llmKey.trim())
    unsub?.()
    opts.onDone()
  }

  back.addEventListener('click', () => {
    if (step > 0) {
      unsub?.()
      step--
      draw()
    }
  })
  primary.addEventListener('click', () => {
    if (step < 3) {
      step++
      draw()
    } else {
      void finish()
    }
  })

  // Load hardware, then render.
  void setup.hardware().then((info) => {
    hw = info
    draft.mode = info.recommend
    draw()
  })
  draw()
}
