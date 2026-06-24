import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderLearn } from '../src/panes/learn/learn-pane'
import type { SpeechPort } from '../src/adapters/speech/speech.adapter'
import type { Lesson } from '@saathi/domain'

const LESSON: Lesson = {
  title: 'Test Lesson',
  subtitle: 'a subtitle',
  blocks: [
    { kind: 'prose', markdown: 'Some **bold** prose.' },
    { kind: 'code', lang: 'javascript', source: 'const x = 1' },
    {
      kind: 'quiz',
      id: 'a',
      question: 'Pick the right one',
      options: ['wrong', 'right', 'other'],
      answer: 1,
      explain: 'because reasons',
    },
    {
      kind: 'quiz',
      id: 'b',
      question: 'Second question',
      options: ['yes', 'no'],
      answer: 0,
      explain: 'second explanation',
    },
  ],
}

describe('TC-10.2 — Learn pane', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
  })

  it('TC-10.2.1 — renders prose, code, and quiz blocks', () => {
    renderLearn(host, { lesson: LESSON })
    expect(host.querySelector('.lsn-title')?.textContent).toBe('Test Lesson')
    expect(host.querySelector('.lsn-prose')?.innerHTML).toContain('<strong>bold</strong>')
    expect(host.querySelector('.lsn-code')?.textContent).toContain('const x = 1')
    expect(host.querySelectorAll('.lsn-quiz').length).toBe(2)
    expect(host.querySelector('#lsn-score')?.textContent).toBe('Score: 0 / 2')
  })

  it('TC-10.2.2 — correct answer: marks correct, explains, locks, scores', () => {
    renderLearn(host, { lesson: LESSON })
    const q = host.querySelector('.lsn-quiz[data-qid="a"]')!
    q.querySelectorAll<HTMLButtonElement>('.lsn-opt')[1].click() // the correct option

    expect(q.querySelector('.lsn-opt.correct')?.textContent).toBe('right')
    const explain = q.querySelector('.lsn-explain')!
    expect((explain as HTMLElement).hidden).toBe(false)
    expect(explain.textContent).toContain('Correct')
    expect(explain.textContent).toContain('because reasons')
    // locked: every option disabled
    expect([...q.querySelectorAll<HTMLButtonElement>('.lsn-opt')].every((o) => o.disabled)).toBe(true)
    expect(host.querySelector('#lsn-score')?.textContent).toBe('Score: 1 / 2')

    // re-clicking a now-disabled option does not change the score
    q.querySelectorAll<HTMLButtonElement>('.lsn-opt')[0].click()
    expect(host.querySelector('#lsn-score')?.textContent).toBe('Score: 1 / 2')
  })

  it('TC-10.2.2 — wrong answer: marks wrong, reveals the correct option', () => {
    renderLearn(host, { lesson: LESSON })
    const q = host.querySelector('.lsn-quiz[data-qid="b"]')!
    q.querySelectorAll<HTMLButtonElement>('.lsn-opt')[1].click() // 'no' — wrong (answer=0)

    expect(q.querySelector('.lsn-opt.wrong')?.textContent).toBe('no')
    expect(q.querySelector('.lsn-opt.correct')?.textContent).toBe('yes') // revealed
    expect(q.querySelector('.lsn-explain')?.textContent).toContain('Not quite')
    expect(host.querySelector('#lsn-score')?.textContent).toBe('Score: 0 / 2')
  })

  it('TC-10.2.3 — Read aloud / Stop drive the injected speech port', () => {
    const speech: SpeechPort = { speak: vi.fn(), stop: vi.fn() }
    renderLearn(host, { lesson: LESSON, speech })

    host.querySelector<HTMLElement>('#lsn-read')!.click()
    expect(speech.speak).toHaveBeenCalledOnce()
    expect((speech.speak as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain('Pick the right one')

    host.querySelector<HTMLElement>('#lsn-stop')!.click()
    expect(speech.stop).toHaveBeenCalledOnce()
  })

  it('uses sampleLesson when none is given', () => {
    renderLearn(host)
    expect(host.querySelector('.lsn-title')?.textContent).toBe('Functions in JavaScript')
    expect(host.querySelectorAll('.lsn-quiz').length).toBeGreaterThanOrEqual(2)
  })
})
