import {
  markdownToHtml,
  gradeQuiz,
  scoreLesson,
  lessonPlainText,
  sampleLesson,
  type Lesson,
  type LessonBlock,
  type QuizBlock,
} from '@saathi/domain'
import { makeSpeech, type SpeechPort } from '../../adapters/speech/speech.adapter'
import { KatexMath, type MathRenderPort } from '../../adapters/katex/math.adapter'
import { ShikiHighlight, type CodeHighlightPort } from '../../adapters/shiki/highlight.adapter'
import {
  MermaidDiagram,
  type DiagramRenderPort,
  type DiagramTheme,
} from '../../adapters/mermaid/diagram.adapter'
import { bridge } from '../../bridge/saathi.bridge'
import type { PyRunResult } from '@saathi/shared'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

/** Runs code (Python) and returns its output. Defaults to the host bridge. */
export type RunFn = (code: string) => Promise<PyRunResult>

export interface LearnOptions {
  lesson?: Lesson
  speech?: SpeechPort
  math?: MathRenderPort
  highlight?: CodeHighlightPort
  diagram?: DiagramRenderPort
  run?: RunFn
}

/**
 * The Learn pane: a structured lesson (prose + code + quiz). Grading and the
 * score are computed by the domain quiz engine — the UI only reflects them.
 */
export function renderLearn(host: HTMLElement, opts: LearnOptions = {}): void {
  const lesson = opts.lesson ?? sampleLesson()
  const speech = opts.speech ?? makeSpeech()
  const math = opts.math ?? new KatexMath()
  const highlighter = opts.highlight ?? new ShikiHighlight()
  const diagrammer = opts.diagram ?? new MermaidDiagram()
  const runCode = opts.run ?? bridge.runPython
  const answers = new Map<string, number>()

  let codeSeq = 0
  let diagSeq = 0
  const blockHtml = (block: LessonBlock, n: number): string => {
    if (block.kind === 'prose') return `<div class="lsn-prose">${markdownToHtml(block.markdown)}</div>`
    if (block.kind === 'code') {
      const i = codeSeq++
      const runUi = block.runnable
        ? `<div class="lsn-run-bar"><button class="lsn-run" data-run="${i}">▶ Run</button></div><pre class="lsn-run-out" data-out="${i}" hidden></pre>`
        : ''
      return `<div class="lsn-code" data-code="${i}"><span class="lsn-lang">${esc(block.lang)}</span><div class="lsn-code-body"><pre><code>${esc(block.source)}</code></pre></div>${runUi}</div>`
    }
    if (block.kind === 'math') {
      const display = block.display ?? true
      const tag = display ? 'div' : 'span'
      return `<${tag} class="lsn-math${display ? '' : ' inline'}">${math.toHtml(block.tex, display)}</${tag}>`
    }
    if (block.kind === 'diagram')
      return `<div class="lsn-diagram" data-diagram="${diagSeq++}">${block.title ? `<div class="lsn-diagram-title">${esc(block.title)}</div>` : ''}<div class="lsn-diagram-body"><pre class="mmd-plain"><code>${esc(block.code)}</code></pre></div></div>`
    return quizHtml(block, n)
  }

  const quizHtml = (quiz: QuizBlock, n: number): string => {
    const opts = quiz.options
      .map(
        (opt, i) =>
          `<button class="lsn-opt" data-qid="${esc(quiz.id)}" data-i="${i}">${esc(opt)}</button>`,
      )
      .join('')
    return `<div class="lsn-quiz" data-qid="${esc(quiz.id)}">
      <div class="lsn-q"><span class="lsn-qn">Q${n}</span>${esc(quiz.question)}</div>
      <div class="lsn-opts">${opts}</div>
      <div class="lsn-explain" hidden></div>
    </div>`
  }

  let qn = 0
  const body = lesson.blocks
    .map((b) => blockHtml(b, b.kind === 'quiz' ? ++qn : qn))
    .join('')

  host.innerHTML = `<div class="learn" data-pane="learn">
    <div class="lsn-head">
      <div class="lsn-titles">
        <h1 class="lsn-title">${esc(lesson.title)}</h1>
        ${lesson.subtitle ? `<p class="lsn-sub">${esc(lesson.subtitle)}</p>` : ''}
      </div>
      <div class="lsn-tools">
        <span class="lsn-score" id="lsn-score"></span>
        <button class="lsn-btn" id="lsn-read">🔊 Read aloud</button>
        <button class="lsn-btn" id="lsn-stop">Stop</button>
      </div>
    </div>
    <div class="lsn-body">${body}</div>
  </div>`

  const scoreEl = host.querySelector<HTMLElement>('#lsn-score')!
  const drawScore = (): void => {
    const s = scoreLesson(lesson, answers)
    scoreEl.textContent = `Score: ${s.correct} / ${s.total}`
  }

  host.querySelectorAll<HTMLButtonElement>('.lsn-opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      const qid = btn.dataset.qid!
      if (answers.has(qid)) return // already answered — locked
      const chosen = Number(btn.dataset.i)
      const quiz = lesson.blocks.find(
        (b): b is QuizBlock => b.kind === 'quiz' && b.id === qid,
      )!
      const grade = gradeQuiz(quiz, chosen)
      answers.set(qid, chosen)

      const quizEl = host.querySelector<HTMLElement>(`.lsn-quiz[data-qid="${qid}"]`)!
      quizEl.querySelectorAll<HTMLButtonElement>('.lsn-opt').forEach((o) => {
        o.disabled = true
        const i = Number(o.dataset.i)
        if (i === quiz.answer) o.classList.add('correct')
        else if (i === chosen) o.classList.add('wrong')
      })
      const explain = quizEl.querySelector<HTMLElement>('.lsn-explain')!
      explain.textContent = `${grade.correct ? '✓ Correct. ' : '✗ Not quite. '}${quiz.explain}`
      explain.classList.toggle('ok', grade.correct)
      explain.hidden = false
      drawScore()
    })
  })

  host.querySelector<HTMLElement>('#lsn-read')!.addEventListener('click', () => {
    speech.speak(lessonPlainText(lesson))
  })
  host.querySelector<HTMLElement>('#lsn-stop')!.addEventListener('click', () => speech.stop())

  // Progressive enhancement: plain code is already on screen; swap in highlighted
  // markup as the (async) highlighter resolves. Failures leave the plain fallback.
  const codeBlocks = lesson.blocks.filter((b): b is Extract<LessonBlock, { kind: 'code' }> => b.kind === 'code')
  codeBlocks.forEach((block, i) => {
    const bodyEl = host.querySelector<HTMLElement>(`.lsn-code[data-code="${i}"] .lsn-code-body`)
    if (!bodyEl) return
    void highlighter
      .highlight(block.source, block.lang)
      .then((html) => {
        bodyEl.innerHTML = html
      })
      .catch(() => {
        /* keep the plain fallback already shown */
      })

    // Runnable snippets: Run → execute (host Pyodide) → show real output.
    if (!block.runnable) return
    const runBtn = host.querySelector<HTMLButtonElement>(`.lsn-run[data-run="${i}"]`)
    const outEl = host.querySelector<HTMLElement>(`.lsn-run-out[data-out="${i}"]`)
    if (!runBtn || !outEl) return
    runBtn.addEventListener('click', () => {
      void (async () => {
        runBtn.disabled = true
        const label = runBtn.textContent
        runBtn.textContent = 'Running…'
        outEl.hidden = false
        outEl.classList.remove('err')
        outEl.textContent = 'Running…'
        const result = await runCode(block.source)
        outEl.textContent = result.output || (result.ok ? '(no output)' : 'Error')
        outEl.classList.toggle('err', !result.ok)
        runBtn.textContent = label
        runBtn.disabled = false
      })()
    })
  })

  // Diagrams: progressive enhancement + theme-reactive re-render. Mermaid bakes
  // colours into the SVG, so on a `data-theme` switch we re-render in the new theme.
  const diagramBlocks = lesson.blocks.filter(
    (b): b is Extract<LessonBlock, { kind: 'diagram' }> => b.kind === 'diagram',
  )
  const currentTheme = (): DiagramTheme =>
    document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  const renderDiagrams = (theme: DiagramTheme): void => {
    diagramBlocks.forEach((block, i) => {
      const bodyEl = host.querySelector<HTMLElement>(`.lsn-diagram[data-diagram="${i}"] .lsn-diagram-body`)
      if (!bodyEl) return
      void diagrammer
        .render(block.code, theme)
        .then((svg) => {
          bodyEl.innerHTML = svg
        })
        .catch(() => {
          /* keep the plain fallback already shown */
        })
    })
  }
  if (diagramBlocks.length > 0) {
    const root = host.querySelector<HTMLElement>('.learn')!
    renderDiagrams(currentTheme())
    const observer = new MutationObserver(() => {
      if (!document.contains(root)) {
        observer.disconnect() // pane navigated away — self-clean
        return
      }
      renderDiagrams(currentTheme())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
  }

  drawScore()
}
