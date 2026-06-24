import { SkillRegistry, runSkill, type Skill } from '@saathi/domain'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

export interface SkillsOptions {
  skills?: SkillRegistry
}

/**
 * The Skills pane: a catalogue of reusable recipes. Each skill builds an agent
 * goal from your input and routes it to the real tools — the answer is computed,
 * shown with the goal it built (transparency).
 */
export function renderSkills(host: HTMLElement, opts: SkillsOptions = {}): void {
  const registry = opts.skills ?? new SkillRegistry()

  const card = (s: Skill): string =>
    `<div class="sk-card" data-skill="${esc(s.id)}">
      <div class="sk-name">${esc(s.name)}</div>
      <div class="sk-desc">${esc(s.description)}</div>
      <div class="sk-run-row">
        <input class="sk-input" placeholder="${esc(s.example)}" spellcheck="false" />
        <button class="sk-run" data-run="${esc(s.id)}">Run</button>
      </div>
      <div class="sk-out" hidden></div>
    </div>`

  host.innerHTML = `<div class="skills" data-pane="skills">
    <div class="sk-head">
      <h1 class="sk-title">Skills</h1>
      <p class="sk-sub">Ready-made recipes — each runs through the agent's real tools, so answers are <strong>computed</strong>, not guessed.</p>
    </div>
    <div class="sk-grid">${registry.list().map(card).join('')}</div>
  </div>`

  host.querySelectorAll<HTMLButtonElement>('.sk-run').forEach((btn) => {
    btn.addEventListener('click', () => {
      const skill = registry.get(btn.dataset.run!)
      if (!skill) return
      const cardEl = btn.closest<HTMLElement>('.sk-card')!
      const inputEl = cardEl.querySelector<HTMLInputElement>('.sk-input')!
      const input = inputEl.value.trim() || skill.example
      const goal = skill.toGoal(input)
      const result = runSkill(skill, input)
      const out = cardEl.querySelector<HTMLElement>('.sk-out')!
      out.innerHTML =
        `<div class="sk-answer">${esc(result.answer)}</div>` +
        `<div class="sk-goal">via <code>${esc(goal)}</code></div>`
      out.hidden = false
    })
  })
}
