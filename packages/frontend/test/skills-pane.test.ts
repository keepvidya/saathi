import { beforeEach, describe, expect, it } from 'vitest'
import { renderSkills } from '../src/panes/skills/skills-pane'
import { BUILTIN_SKILLS } from '@saathi/domain'

describe('TC-19.2 — Skills pane', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
    renderSkills(host)
  })

  it('TC-19.2.1 — renders a card per builtin skill', () => {
    expect(host.querySelectorAll('.sk-card')).toHaveLength(BUILTIN_SKILLS.length)
    const names = [...host.querySelectorAll('.sk-name')].map((e) => e.textContent)
    expect(names).toContain('Percentage')
    expect(names).toContain('Tip splitter')
  })

  it('TC-19.2.2 — running a skill shows the computed answer + the built goal', () => {
    const card = host.querySelector<HTMLElement>('.sk-card[data-skill="percent"]')!
    card.querySelector<HTMLInputElement>('.sk-input')!.value = '15% of 240'
    card.querySelector<HTMLButtonElement>('.sk-run')!.click()

    const out = card.querySelector<HTMLElement>('.sk-out')!
    expect(out.hidden).toBe(false)
    expect(out.querySelector('.sk-answer')?.textContent).toBe('36')
    expect(out.querySelector('.sk-goal')?.textContent).toContain('(240 * 15 / 100)')
  })

  it('uses the example when the input is empty', () => {
    const card = host.querySelector<HTMLElement>('.sk-card[data-skill="tip"]')!
    card.querySelector<HTMLButtonElement>('.sk-run')!.click() // example '120, 4, 18'
    expect(card.querySelector('.sk-answer')?.textContent).toBe('35.4')
  })
})
