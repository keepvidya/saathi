import { beforeEach, describe, expect, it } from 'vitest'
import { renderAgent } from '../src/panes/agent/agent-pane'

describe('TC-17.2.1 — Agent pane', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
    renderAgent(host)
  })

  const submit = (goal: string): void => {
    host.querySelector<HTMLInputElement>('#ag-in')!.value = goal
    host.querySelector<HTMLElement>('#ag-run')!.click()
  }

  it('renders the empty hint before any goal', () => {
    expect(host.querySelector('.agent')).toBeTruthy()
    expect(host.querySelector('.ag-empty')).toBeTruthy()
  })

  it('a calculation goal shows a trace + the exact answer', () => {
    submit('12.5 * (8 + 4)')
    expect(host.querySelector('.ag-goal')?.textContent).toBe('12.5 * (8 + 4)')
    // a delegate step to the calc worker
    const act = host.querySelector('.ag-step.ph-act')!
    expect(act.querySelector('.ag-chip')?.textContent).toBe('calc')
    expect(host.querySelector('.ag-answer')?.textContent).toContain('150')
  })

  it('a question goal shows a grounded search answer', () => {
    submit('what is photosynthesis?')
    expect(host.querySelector('.ag-step.ph-act .ag-chip')?.textContent).toBe('search')
    expect(host.querySelector('.ag-answer')?.textContent?.toLowerCase()).toContain('photosynthesis')
  })

  it('an empty goal does nothing (stays on the hint)', () => {
    submit('   ')
    expect(host.querySelector('.ag-empty')).toBeTruthy()
    expect(host.querySelector('.ag-answer')).toBeNull()
  })
})
