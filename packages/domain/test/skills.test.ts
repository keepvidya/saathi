import { describe, it, expect } from 'vitest'
import { SkillRegistry, BUILTIN_SKILLS, runSkill } from '../src/index'

const reg = new SkillRegistry()
const skill = (id: string) => reg.get(id)!

describe('TC-19.1.1 — skill registry', () => {
  it('lists the builtin skills with unique ids', () => {
    const ids = reg.list().map((s) => s.id)
    expect(ids).toEqual(BUILTIN_SKILLS.map((s) => s.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('TC-19.1.2 — skills build goals that compute the right answer', () => {
  it('Calculator → exact arithmetic', () => {
    expect(runSkill(skill('calc'), '12.5 * (8 + 4)').answer).toBe('150')
  })
  it('Percentage → X% of Y', () => {
    expect(skill('percent').toGoal('15% of 240')).toBe('(240 * 15 / 100)')
    expect(runSkill(skill('percent'), '15% of 240').answer).toBe('36')
  })
  it('Tip splitter → per-person with tip', () => {
    expect(runSkill(skill('tip'), '120, 4, 18').answer).toBe('35.4')
  })
  it('Average → mean of the list', () => {
    expect(skill('avg').toGoal('10, 20, 30')).toBe('AVERAGE(10,20,30)')
    expect(runSkill(skill('avg'), '10, 20, 30').answer).toBe('20')
  })
  it('Look up → a grounded knowledge answer', () => {
    expect(runSkill(skill('define'), 'HTTP').answer.toLowerCase()).toContain('http')
  })
})

describe('TC-19.1.3 — robust inputs', () => {
  it('a percentage with missing numbers falls back to the raw input', () => {
    expect(skill('percent').toGoal('hello')).toBe('hello')
  })
  it('an empty average falls back to the raw input', () => {
    expect(skill('avg').toGoal('nothing')).toBe('nothing')
  })
})
