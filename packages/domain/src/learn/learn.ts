/**
 * Learn — pure lesson model + a deterministic quiz engine.
 *
 * DNA: correctness is decided by OUR code. `gradeQuiz` and `scoreLesson` are
 * pure functions; the UI only reflects their verdict. A model could later
 * *author* lesson prose behind a port, but it never decides what's right.
 */

export interface ProseBlock {
  kind: 'prose'
  markdown: string
}
export interface CodeBlock {
  kind: 'code'
  lang: string
  source: string
}
export interface QuizBlock {
  kind: 'quiz'
  id: string
  question: string
  options: string[]
  /** index into `options` that is correct */
  answer: number
  explain: string
}
export type LessonBlock = ProseBlock | CodeBlock | QuizBlock

export interface Lesson {
  title: string
  subtitle?: string
  blocks: LessonBlock[]
}

export interface QuizGrade {
  correct: boolean
  chosen: number
  answer: number
  explain: string
}

export interface LessonScore {
  correct: number
  total: number
  answered: number
}

/** Grade a single quiz answer. Deterministic: correct ⇔ chosen === answer. */
export function gradeQuiz(quiz: QuizBlock, chosen: number): QuizGrade {
  return { correct: chosen === quiz.answer, chosen, answer: quiz.answer, explain: quiz.explain }
}

/** All quiz blocks in a lesson, in order. */
export function quizzes(lesson: Lesson): QuizBlock[] {
  return lesson.blocks.filter((b): b is QuizBlock => b.kind === 'quiz')
}

/**
 * Tally a lesson's quizzes against the learner's answers (quizId → chosen).
 * `total` = number of quizzes; `answered` = quizzes with a recorded choice;
 * `correct` = those graded correct. Single pass, O(b).
 */
export function scoreLesson(lesson: Lesson, answers: ReadonlyMap<string, number>): LessonScore {
  let correct = 0
  let answered = 0
  const qs = quizzes(lesson)
  for (const quiz of qs) {
    if (!answers.has(quiz.id)) continue
    answered++
    if (gradeQuiz(quiz, answers.get(quiz.id) as number).correct) correct++
  }
  return { correct, total: qs.length, answered }
}

/** Strip light markdown markers so prose reads cleanly aloud / indexes plainly. */
function stripMarkdown(md: string): string {
  return md
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1') // code spans/fences
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1') // bold/italic
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/^[-*]\s+/gm, '') // list bullets
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → text
    .replace(/\s+/g, ' ')
    .trim()
}

/** Narration text for read-aloud / search: prose (markers stripped) + quiz questions. */
export function lessonPlainText(lesson: Lesson): string {
  const parts: string[] = [lesson.title]
  if (lesson.subtitle) parts.push(lesson.subtitle)
  for (const block of lesson.blocks) {
    if (block.kind === 'prose') parts.push(stripMarkdown(block.markdown))
    else if (block.kind === 'quiz') parts.push(block.question)
  }
  return parts.filter((p) => p.length > 0).join('\n\n')
}

/** A short ready lesson — prose + a code block + two quizzes. */
export function sampleLesson(): Lesson {
  return {
    title: 'Functions in JavaScript',
    subtitle: 'Reusable blocks of logic',
    blocks: [
      {
        kind: 'prose',
        markdown:
          'A **function** is a reusable block of code. You **define** it once and **call** it many times. ' +
          'Functions can take *inputs* (parameters) and `return` a value.',
      },
      {
        kind: 'code',
        lang: 'javascript',
        source: 'function add(a, b) {\n  return a + b\n}\n\nadd(2, 3) // → 5',
      },
      {
        kind: 'quiz',
        id: 'q1',
        question: 'What does add(2, 3) return?',
        options: ['23', '5', 'undefined', 'an error'],
        answer: 1,
        explain: 'The function returns a + b, and 2 + 3 is 5.',
      },
      {
        kind: 'prose',
        markdown:
          'A function that does not hit a `return` statement gives back `undefined`.',
      },
      {
        kind: 'quiz',
        id: 'q2',
        question: 'A function with no return statement returns…',
        options: ['0', 'null', 'undefined', 'the last line'],
        answer: 2,
        explain: 'With no explicit return, JavaScript functions return undefined.',
      },
    ],
  }
}
