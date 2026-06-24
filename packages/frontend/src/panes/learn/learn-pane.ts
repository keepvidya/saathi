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

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

export interface LearnOptions {
  lesson?: Lesson
  speech?: SpeechPort
  math?: MathRenderPort
}

/**
 * The Learn pane: a structured lesson (prose + code + quiz). Grading and the
 * score are computed by the domain quiz engine — the UI only reflects them.
 */
export function renderLearn(host: HTMLElement, opts: LearnOptions = {}): void {
  const lesson = opts.lesson ?? sampleLesson()
  const speech = opts.speech ?? makeSpeech()
  const math = opts.math ?? new KatexMath()
  const answers = new Map<string, number>()

  const blockHtml = (block: LessonBlock, n: number): string => {
    if (block.kind === 'prose') return `<div class="lsn-prose">${markdownToHtml(block.markdown)}</div>`
    if (block.kind === 'code')
      return `<div class="lsn-code"><span class="lsn-lang">${esc(block.lang)}</span><pre><code>${esc(block.source)}</code></pre></div>`
    if (block.kind === 'math') {
      const display = block.display ?? true
      const tag = display ? 'div' : 'span'
      return `<${tag} class="lsn-math${display ? '' : ' inline'}">${math.toHtml(block.tex, display)}</${tag}>`
    }
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

  drawScore()
}
