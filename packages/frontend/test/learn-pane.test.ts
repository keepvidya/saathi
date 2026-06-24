import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderLearn, type LearnOptions } from '../src/panes/learn/learn-pane'
import type { SpeechPort } from '../src/adapters/speech/speech.adapter'
import { PlainMath } from '../src/adapters/katex/math.adapter'
import { PlainHighlight, type CodeHighlightPort } from '../src/adapters/shiki/highlight.adapter'
import { PlainDiagram, type DiagramRenderPort } from '../src/adapters/mermaid/diagram.adapter'
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

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

describe('TC-10.2 — Learn pane', () => {
  let host: HTMLElement
  // Default to plain adapters so unit tests never load Shiki/Mermaid (fast + deterministic).
  const render = (opts: LearnOptions = {}): void =>
    renderLearn(host, { highlight: new PlainHighlight(), diagram: new PlainDiagram(), ...opts })

  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
  })
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it('TC-10.2.1 — renders prose, code, and quiz blocks', () => {
    render({ lesson: LESSON })
    expect(host.querySelector('.lsn-title')?.textContent).toBe('Test Lesson')
    expect(host.querySelector('.lsn-prose')?.innerHTML).toContain('<strong>bold</strong>')
    expect(host.querySelector('.lsn-code')?.textContent).toContain('const x = 1')
    expect(host.querySelectorAll('.lsn-quiz').length).toBe(2)
    expect(host.querySelector('#lsn-score')?.textContent).toBe('Score: 0 / 2')
  })

  it('TC-10.2.2 — correct answer: marks correct, explains, locks, scores', () => {
    render({ lesson: LESSON })
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
    render({ lesson: LESSON })
    const q = host.querySelector('.lsn-quiz[data-qid="b"]')!
    q.querySelectorAll<HTMLButtonElement>('.lsn-opt')[1].click() // 'no' — wrong (answer=0)

    expect(q.querySelector('.lsn-opt.wrong')?.textContent).toBe('no')
    expect(q.querySelector('.lsn-opt.correct')?.textContent).toBe('yes') // revealed
    expect(q.querySelector('.lsn-explain')?.textContent).toContain('Not quite')
    expect(host.querySelector('#lsn-score')?.textContent).toBe('Score: 0 / 2')
  })

  it('TC-10.2.3 — Read aloud / Stop drive the injected speech port', () => {
    const speech: SpeechPort = { speak: vi.fn(), stop: vi.fn() }
    render({ lesson: LESSON, speech })

    host.querySelector<HTMLElement>('#lsn-read')!.click()
    expect(speech.speak).toHaveBeenCalledOnce()
    expect((speech.speak as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain('Pick the right one')

    host.querySelector<HTMLElement>('#lsn-stop')!.click()
    expect(speech.stop).toHaveBeenCalledOnce()
  })

  it('uses sampleLesson when none is given', () => {
    render()
    expect(host.querySelector('.lsn-title')?.textContent).toBe('Functions in JavaScript')
    expect(host.querySelectorAll('.lsn-quiz').length).toBeGreaterThanOrEqual(2)
  })

  it('TC-11.2.1 — renders a math block via KaTeX (default port)', () => {
    const lesson: Lesson = {
      title: 'Math',
      blocks: [{ kind: 'math', tex: 'a^2+b^2=c^2', display: true }],
    }
    render({ lesson })
    const mathEl = host.querySelector('.lsn-math')
    expect(mathEl).toBeTruthy()
    expect(mathEl?.querySelector('.katex')).toBeTruthy()
  })

  it('TC-11.2.2 — injected PlainMath fallback shows escaped source', () => {
    const lesson: Lesson = {
      title: 'Math',
      blocks: [{ kind: 'math', tex: 'x<y', display: false }],
    }
    render({ lesson, math: new PlainMath() })
    const mathEl = host.querySelector('.lsn-math')
    expect(mathEl?.classList.contains('inline')).toBe(true)
    expect(mathEl?.innerHTML).toContain('x&lt;y')
  })

  it('TC-12.2.1 — code shows plain first, then is replaced by the highlighter', async () => {
    const lesson: Lesson = {
      title: 'Code',
      blocks: [{ kind: 'code', lang: 'javascript', source: 'const x = 1' }],
    }
    const highlight: CodeHighlightPort = {
      highlight: vi.fn().mockResolvedValue('<pre class="shiki"><code>HIGHLIGHTED</code></pre>'),
    }
    render({ lesson, highlight })

    // synchronously: the plain fallback is on screen
    expect(host.querySelector('.lsn-code-body')?.textContent).toContain('const x = 1')
    expect(host.querySelector('.lsn-code .shiki')).toBeNull()

    await flush()
    // after the promise resolves: highlighted markup swapped in
    expect(highlight.highlight).toHaveBeenCalledWith('const x = 1', 'javascript')
    expect(host.querySelector('.lsn-code .shiki')?.textContent).toBe('HIGHLIGHTED')
  })

  it('TC-12.2.2 — PlainHighlight fallback keeps escaped code, no throw', async () => {
    const lesson: Lesson = {
      title: 'Code',
      blocks: [{ kind: 'code', lang: 'js', source: '<b>x</b>' }],
    }
    render({ lesson, highlight: new PlainHighlight() })
    await flush()
    expect(host.querySelector('.lsn-code-body')?.innerHTML).toContain('&lt;b&gt;x&lt;/b&gt;')
  })

  const diagramLesson: Lesson = {
    title: 'Diagram',
    blocks: [{ kind: 'diagram', title: 'Flow', code: 'graph LR; A-->B' }],
  }

  it('TC-13.2.1 — diagram shows source first, then the rendered SVG', async () => {
    const diagram: DiagramRenderPort = {
      render: vi.fn().mockResolvedValue('<svg id="d">SVG</svg>'),
    }
    render({ lesson: diagramLesson, diagram })

    // synchronously: the plain source is shown
    expect(host.querySelector('.lsn-diagram-body')?.textContent).toContain('graph LR; A-->B')
    expect(host.querySelector('.lsn-diagram-body svg')).toBeNull()

    await flush()
    expect(diagram.render).toHaveBeenCalledWith('graph LR; A-->B', 'light')
    expect(host.querySelector('.lsn-diagram-body svg')?.textContent).toBe('SVG')
  })

  it('TC-13.2.2 — a theme switch re-renders the diagram in the new theme', async () => {
    const diagram: DiagramRenderPort = {
      render: vi.fn().mockResolvedValue('<svg>X</svg>'),
    }
    render({ lesson: diagramLesson, diagram })
    await flush()
    expect(diagram.render).toHaveBeenLastCalledWith('graph LR; A-->B', 'light')

    document.documentElement.setAttribute('data-theme', 'dark')
    await flush()
    expect(diagram.render).toHaveBeenLastCalledWith('graph LR; A-->B', 'dark')
  })

  it('TC-13.2.3 — PlainDiagram fallback keeps the escaped source, no throw', async () => {
    render({ lesson: { title: 'D', blocks: [{ kind: 'diagram', code: 'a<b' }] }, diagram: new PlainDiagram() })
    await flush()
    expect(host.querySelector('.lsn-diagram-body')?.innerHTML).toContain('a&lt;b')
  })
})
