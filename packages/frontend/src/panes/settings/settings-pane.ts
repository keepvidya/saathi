import { SECRET_LLM, SECRET_SEARCH, defaultSettings, type AppSettings } from '@saathi/shared'
import { bridge, type SettingsControl } from '../../bridge/saathi.bridge'
import { THEMES, setSkin, currentSkin } from '../../theme/theme'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

export interface SettingsOptions {
  settings?: SettingsControl
}

/** Settings: profile, AI provider (offline/cloud + key), search, appearance, about. Keys are encrypted; never shown back. */
export function renderSettings(host: HTMLElement, opts: SettingsOptions = {}): void {
  const ctrl = opts.settings ?? bridge.settingsControl()
  let settings: AppSettings = defaultSettings()

  const keyField = (name: string, label: string): string =>
    `<div class="set-key" data-key="${name}">
      <div class="set-key-top"><span class="set-key-label">${esc(label)}</span><span class="set-key-status" data-status>Not set</span></div>
      <div class="set-key-row">
        <input type="password" class="set-key-input" placeholder="Paste your key" autocomplete="off" />
        <button class="set-key-save">Save</button>
        <button class="set-key-remove" hidden>Remove</button>
      </div>
    </div>`

  host.innerHTML = `<div class="settings" data-pane="settings">
    <div class="set-head"><h1 class="set-title">Settings</h1><p class="set-sub">Local by default. Keys are encrypted and never shown back.</p></div>
    <div class="set-body">
      <section class="set-sec">
        <h2 class="set-h">Profile</h2>
        <label class="set-field"><span>What should I call you?</span>
          <input id="set-name" class="set-input" placeholder="Your name" /></label>
      </section>

      <section class="set-sec">
        <h2 class="set-h">AI provider</h2>
        <div class="set-radios" id="set-llm">
          <label><input type="radio" name="llm" value="offline"> <b>Offline</b> — local Ollama + Shiva, fully private</label>
          <label><input type="radio" name="llm" value="cloud"> <b>Cloud (BYOK)</b> — use your own provider key</label>
        </div>
        <div id="set-llm-key" hidden>
          <label class="set-field"><span>Cloud provider</span>
            <select id="set-cloud" class="set-input">
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select></label>
          ${keyField(SECRET_LLM, 'API key')}
        </div>
      </section>

      <section class="set-sec">
        <h2 class="set-h">Web search</h2>
        <label class="set-field"><span>Provider</span>
          <select id="set-search" class="set-input">
            <option value="none">None</option>
            <option value="serper">Serper</option>
            <option value="brave">Brave</option>
          </select></label>
        <div id="set-search-key" hidden>${keyField(SECRET_SEARCH, 'Search API key')}</div>
      </section>

      <section class="set-sec">
        <h2 class="set-h">Appearance</h2>
        <div class="set-themes" id="set-themes">${THEMES.map(
          (t) => `<button class="set-theme" data-skin="${t.id}">${esc(t.name)}</button>`,
        ).join('')}</div>
      </section>

      <section class="set-sec">
        <h2 class="set-h">About</h2>
        <p class="set-about" id="set-about">Saathi — local-first AI workspace.</p>
      </section>
    </div>
  </div>`

  const $ = <T extends HTMLElement>(s: string): T => host.querySelector<T>(s)!
  const nameEl = $<HTMLInputElement>('#set-name')
  const cloudEl = $<HTMLSelectElement>('#set-cloud')
  const searchEl = $<HTMLSelectElement>('#set-search')

  const markThemes = (): void => {
    const active = currentSkin().id
    host.querySelectorAll<HTMLElement>('.set-theme').forEach((b) => {
      b.classList.toggle('active', b.dataset.skin === active)
    })
  }

  const refreshKey = async (name: string): Promise<void> => {
    const box = host.querySelector<HTMLElement>(`.set-key[data-key="${name}"]`)
    if (!box) return
    const has = await ctrl.hasSecret(name)
    box.querySelector<HTMLElement>('[data-status]')!.textContent = has ? 'Set ✓ (encrypted)' : 'Not set'
    box.querySelector<HTMLElement>('.set-key-remove')!.hidden = !has
  }

  const applyView = (): void => {
    nameEl.value = settings.userName
    ;(host.querySelector<HTMLInputElement>(`#set-llm input[value="${settings.llmMode}"]`))!.checked = true
    $<HTMLElement>('#set-llm-key').hidden = settings.llmMode !== 'cloud'
    cloudEl.value = settings.cloudProvider
    searchEl.value = settings.searchProvider
    $<HTMLElement>('#set-search-key').hidden = settings.searchProvider === 'none'
    markThemes()
  }

  // wire (handlers persist across loads; the DOM is built once)
  nameEl.addEventListener('change', () => void ctrl.set({ userName: nameEl.value.trim() }))
  host.querySelectorAll<HTMLInputElement>('#set-llm input').forEach((r) =>
    r.addEventListener('change', () => {
      if (!r.checked) return
      settings = { ...settings, llmMode: r.value as AppSettings['llmMode'] }
      void ctrl.set({ llmMode: settings.llmMode })
      $<HTMLElement>('#set-llm-key').hidden = settings.llmMode !== 'cloud'
    }),
  )
  cloudEl.addEventListener('change', () => void ctrl.set({ cloudProvider: cloudEl.value }))
  searchEl.addEventListener('change', () => {
    settings = { ...settings, searchProvider: searchEl.value as AppSettings['searchProvider'] }
    void ctrl.set({ searchProvider: settings.searchProvider })
    $<HTMLElement>('#set-search-key').hidden = settings.searchProvider === 'none'
  })
  host.querySelectorAll<HTMLElement>('.set-key').forEach((box) => {
    const name = box.dataset.key!
    const input = box.querySelector<HTMLInputElement>('.set-key-input')!
    box.querySelector<HTMLElement>('.set-key-save')!.addEventListener('click', () => {
      if (!input.value.trim()) return
      void ctrl.setSecret(name, input.value.trim()).then(() => {
        input.value = ''
        return refreshKey(name)
      })
    })
    box.querySelector<HTMLElement>('.set-key-remove')!.addEventListener('click', () => {
      void ctrl.clearSecret(name).then(() => refreshKey(name))
    })
  })
  host.querySelectorAll<HTMLElement>('.set-theme').forEach((b) =>
    b.addEventListener('click', () => {
      setSkin(b.dataset.skin!)
      markThemes()
    }),
  )

  void (async () => {
    settings = await ctrl.get()
    applyView()
    await Promise.all([refreshKey(SECRET_LLM), refreshKey(SECRET_SEARCH)])
    const info = await bridge.getAppInfo()
    $<HTMLElement>('#set-about').textContent = `Saathi ${info.version} — local-first AI workspace.`
  })()
}
