import { describe, it, expect } from 'vitest'
import {
  gradeQuiz,
  scoreLesson,
  lessonPlainText,
  quizzes,
  sampleLesson,
  type QuizBlock,
} from '../src/learn/learn'

const quiz: QuizBlock = {
  kind: 'quiz',
  id: 'qx',
  question: 'What is 2 + 2?',
  options: ['3', '4', '5'],
  answer: 1,
  explain: 'Two plus two is four.',
}

describe('TC-10.1.1 — sample lesson shape', () => {
  it('has a title and prose + code + ≥2 quizzes with unique ids', () => {
    const lesson = sampleLesson()
    expect(lesson.title.length).toBeGreaterThan(0)
    expect(lesson.blocks.some((b) => b.kind === 'prose')).toBe(true)
    expect(lesson.blocks.some((b) => b.kind === 'code')).toBe(true)
    const qs = quizzes(lesson)
    expect(qs.length).toBeGreaterThanOrEqual(2)
    expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length) // unique ids
  })
})

describe('TC-10.1.2 — gradeQuiz is deterministic', () => {
  it('marks the correct option correct', () => {
    expect(gradeQuiz(quiz, 1)).toEqual({
      correct: true,
      chosen: 1,
      answer: 1,
      explain: 'Two plus two is four.',
    })
  })
  it('marks any other option incorrect', () => {
    const g = gradeQuiz(quiz, 0)
    expect(g.correct).toBe(false)
    expect(g.chosen).toBe(0)
    expect(g.answer).toBe(1)
  })
})

describe('TC-10.1.3 — scoreLesson tallies correct/total/answered', () => {
  const lesson = sampleLesson() // q1 answer=1, q2 answer=2

  it('all correct', () => {
    const answers = new Map([
      ['q1', 1],
      ['q2', 2],
    ])
    expect(scoreLesson(lesson, answers)).toEqual({ correct: 2, total: 2, answered: 2 })
  })
  it('one correct, one wrong', () => {
    const answers = new Map([
      ['q1', 1],
      ['q2', 0],
    ])
    expect(scoreLesson(lesson, answers)).toEqual({ correct: 1, total: 2, answered: 2 })
  })
  it('only one answered', () => {
    expect(scoreLesson(lesson, new Map([['q1', 1]]))).toEqual({
      correct: 1,
      total: 2,
      answered: 1,
    })
  })
  it('none answered', () => {
    expect(scoreLesson(lesson, new Map())).toEqual({ correct: 0, total: 2, answered: 0 })
  })
})

describe('TC-10.1.4 — lessonPlainText is narration-ready', () => {
  it('includes prose + questions, with markdown markers stripped', () => {
    const text = lessonPlainText(sampleLesson())
    expect(text).toContain('reusable block of code') // prose, ** stripped
    expect(text).toContain('What does add(2, 3) return?') // a quiz question
    expect(text).not.toMatch(/[*#`]/) // no markdown markers survive
  })
})

describe('TC-11.1 — math block (domain)', () => {
  it('sampleLesson includes a math block', () => {
    const math = sampleLesson().blocks.filter((b) => b.kind === 'math')
    expect(math.length).toBeGreaterThanOrEqual(1)
  })
  it('lessonPlainText omits math TeX (not narration-friendly)', () => {
    expect(lessonPlainText(sampleLesson())).not.toContain('\\pi') // the sample's formula
  })
})

describe('TC-13.1 — diagram block (domain)', () => {
  it('sampleLesson includes a diagram block', () => {
    const diagrams = sampleLesson().blocks.filter((b) => b.kind === 'diagram')
    expect(diagrams.length).toBeGreaterThanOrEqual(1)
  })
  it('lessonPlainText omits the diagram definition', () => {
    expect(lessonPlainText(sampleLesson())).not.toContain('graph')
  })
})

describe('TC-14.1 — runnable code block (domain)', () => {
  it('sampleLesson includes a runnable Python block', () => {
    const runnable = sampleLesson().blocks.filter((b) => b.kind === 'code' && b.runnable)
    expect(runnable.length).toBeGreaterThanOrEqual(1)
    expect(runnable[0]).toMatchObject({ lang: 'python' })
  })
})
