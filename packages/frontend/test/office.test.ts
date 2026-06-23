import { beforeEach, describe, expect, it } from 'vitest'
import { renderOffice } from '../src/panes/office/office'

const click = (host: HTMLElement, sel: string) => host.querySelector<HTMLElement>(sel)!.click()

describe('TC-06.1 — Office home routing', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
    renderOffice(host)
  })

  it('TC-06.1.1 — home shows sections; create cards open the right editor', () => {
    expect(host.querySelector('#oh-create')).toBeTruthy()
    expect(host.querySelector('#oh-tpl')).toBeTruthy()
    expect(host.querySelector('#oh-recent')).toBeTruthy()

    click(host, '#oh-create .oh-card[data-kind="sheets"]')
    expect(host.querySelector('.sheets')).toBeTruthy()
    expect(host.querySelector('td[data-ref="E2"]')?.textContent).toBe('447')

    click(host, '#oback')
    expect(host.querySelector('#oh-create')).toBeTruthy()
    click(host, '#oh-create .oh-card[data-kind="slides"]')
    expect(host.querySelector('.slide-canvas')).toBeTruthy()
  })

  it('TC-06.1.2 — templates open the matching editor', () => {
    click(host, '#oh-tpl .oh-card[data-kind="docs"]')
    expect(host.querySelector('.docpage h1')?.textContent).toBe('Project Proposal')
    click(host, '#oback')
    click(host, '#oh-tpl .oh-card[data-kind="slides"]')
    expect(host.querySelector('.slide-canvas')).toBeTruthy()
  })

  it('TC-06.1.3 — recent updates and reopens', () => {
    click(host, '#oh-create .oh-card[data-kind="docs"]') // open "Document"
    click(host, '#oback')
    const rec = [...host.querySelectorAll<HTMLElement>('#oh-recent .oh-rec')].find((r) =>
      r.textContent?.includes('Document'),
    )!
    expect(rec).toBeTruthy()
    rec.click()
    expect(host.querySelector('.docpage')).toBeTruthy()
  })

  it('TC-06.1.4 — back + switcher intact', () => {
    click(host, '#oh-create .oh-card[data-kind="docs"]')
    expect(host.querySelector('.docpage')).toBeTruthy()
    click(host, '.otab[data-kind="slides"]') // switcher still works
    expect(host.querySelector('.slide-canvas')).toBeTruthy()
    click(host, '#oback')
    expect(host.querySelector('#oh-create')).toBeTruthy()
  })
})
