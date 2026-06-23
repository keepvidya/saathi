import { beforeEach, describe, expect, it } from 'vitest'
import { mountShell } from '../src/shell/shell'

describe('TC-00.2.2 — shell mount wires rail → router', () => {
  let root: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    root = document.createElement('div')
    document.body.append(root)
  })

  it('mounts rail + body with default pane (chat)', () => {
    mountShell(root)
    expect(root.querySelector('.rail')).toBeTruthy()
    expect(root.querySelector('.railbrand')?.textContent).toContain('Saathi')
    expect(root.querySelector('#body [data-pane]')?.getAttribute('data-pane')).toBe('chat')
  })

  it('clicking a rail item switches the pane and marks it active', () => {
    mountShell(root)
    const officeBtn = root.querySelector<HTMLElement>('[data-pane="office"]')!
    officeBtn.click()
    expect(root.querySelector('#body [data-pane]')?.getAttribute('data-pane')).toBe('office')
    expect(officeBtn.classList.contains('active')).toBe(true)
  })
})
