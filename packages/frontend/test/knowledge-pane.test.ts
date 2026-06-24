import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderKnowledge } from '../src/panes/knowledge/knowledge-pane'

describe('TC-09.2.2 — Knowledge pane: ingest → ask → cited answer', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
    renderKnowledge(host)
  })
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).saathi
  })

  const add = (title: string, text: string): void => {
    host.querySelector<HTMLInputElement>('#kn-title')!.value = title
    host.querySelector<HTMLTextAreaElement>('#kn-text')!.value = text
    host.querySelector<HTMLElement>('#kn-add')!.click()
  }
  const ask = (q: string): void => {
    host.querySelector<HTMLInputElement>('#kn-query')!.value = q
    host.querySelector<HTMLElement>('#kn-ask')!.click()
  }

  it('renders the add-form and seed document', () => {
    expect(host.querySelector('.knowledge')).toBeTruthy()
    const docs = [...host.querySelectorAll('.kn-doc')].map((d) => d.textContent)
    expect(docs.some((t) => t?.includes('About Saathi'))).toBe(true)
  })

  it('an added document appears in the doc list', () => {
    add('Plant Biology', 'Photosynthesis converts sunlight into chemical energy in green plants.')
    const docs = [...host.querySelectorAll('.kn-doc')].map((d) => d.textContent)
    expect(docs.some((t) => t?.includes('Plant Biology'))).toBe(true)
  })

  it('asking a matching question renders an answer + a citation chip to the source', () => {
    add('Plant Biology', 'Photosynthesis converts sunlight into chemical energy in green plants.')
    ask('how does photosynthesis convert sunlight')

    const answer = host.querySelector('.kn-a')!
    expect(answer.textContent?.toLowerCase()).toContain('photosynthesis')

    const cites = [...host.querySelectorAll('.kn-cite')]
    expect(cites.length).toBeGreaterThanOrEqual(1)
    expect(cites[0].textContent).toContain('Plant Biology')
    expect(host.querySelector('.kn-cite-n')?.textContent).toBe('1')
  })

  it('empty query does nothing (stays on the empty state)', () => {
    ask('   ')
    expect(host.querySelector('.kn-empty')).toBeTruthy()
    expect(host.querySelector('.kn-cite')).toBeNull()
  })

  it('adding with no text shows a hint and adds nothing', () => {
    const before = host.querySelectorAll('.kn-doc').length
    host.querySelector<HTMLElement>('#kn-add')!.click()
    expect(host.querySelectorAll('.kn-doc').length).toBe(before)
    expect(host.querySelector<HTMLElement>('#kn-note')!.hidden).toBe(false)
  })
})
