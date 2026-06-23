import { beforeEach, describe, expect, it } from 'vitest'
import { TemplateLlm } from '@saathi/domain'
import { aiBuild, type BuiltModel } from '../src/panes/office/ai-build'
import { renderSlides } from '../src/panes/office/slides-editor'

describe('TC-05.2.1 — AI build panel', () => {
  let body: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    body = document.createElement('div')
    document.body.append(body)
  })

  it('renders the ReAct step log and produces a valid model', async () => {
    let model: BuiltModel
    const r = await aiBuild('slides', 'Launch plan', body, new TemplateLlm(), (m) => (model = m), 0)
    expect(r.steps.length).toBeGreaterThan(0)
    expect(body.querySelectorAll('.bl-step').length).toBe(r.steps.length)
    expect(r.valid).toBe(true)
    expect((model as { title: string }).title).toBe('Launch plan')
  })

  it('loads the built draft into the editor', async () => {
    await aiBuild('slides', 'Launch plan', body, new TemplateLlm(), (m) => renderSlides(body, m as never), 0)
    expect(body.querySelector('.slide-canvas .slide-title')?.textContent).toBe('Launch plan')
  })
})
