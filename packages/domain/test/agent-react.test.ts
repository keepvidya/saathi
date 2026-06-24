import { describe, it, expect } from 'vitest'
import {
  calcTool,
  makeSearchTool,
  ToolRegistry,
  RulefulPlanner,
  runAgent,
  runDefaultAgent,
  type Planner,
} from '../src/index'

describe('TC-17.1.1 — calc tool (formula engine)', () => {
  it('evaluates arithmetic exactly', () => {
    expect(calcTool.run('12.5 * (8 + 4)')).toBe('150')
    expect(calcTool.run('(240*0.15)+30')).toBe('66')
    expect(calcTool.run('SUM(10,20,30)')).toBe('60')
  })
  it('returns an error value (no throw) for bad input', () => {
    expect(calcTool.run('1/0')).toBe('#DIV/0')
    expect(() => calcTool.run('@#$')).not.toThrow()
  })
})

describe('TC-17.1.2 — search tool (knowledge)', () => {
  it('answers from the seeded corpus, grounded + sourced', () => {
    const out = makeSearchTool().run('what is photosynthesis')
    expect(out.toLowerCase()).toContain('photosynthesis')
    expect(out).toContain('source: Photosynthesis')
  })
})

describe('TC-17.1.3 — runAgent routes + traces', () => {
  it('a calculation goal → calc → exact answer, with a full trace', () => {
    const result = runDefaultAgent('12.5 * (8 + 4)')
    expect(result.answer).toBe('150')
    const phases = result.steps.map((s) => s.phase)
    expect(phases).toEqual(['reason', 'act', 'observe', 'reason', 'answer'])
    expect(result.steps.find((s) => s.phase === 'act')?.agent).toBe('calc')
  })
  it('“what is …?” → search → grounded answer', () => {
    const result = runDefaultAgent('what is HTTP?')
    expect(result.steps.some((s) => s.phase === 'act' && s.agent === 'search')).toBe(true)
    expect(result.answer.toLowerCase()).toContain('http')
  })
  it('a goal needing no tool → a helpful default, no act', () => {
    const result = runDefaultAgent('hello there')
    expect(result.steps.some((s) => s.phase === 'act')).toBe(false)
    expect(result.answer.length).toBeGreaterThan(0)
  })
  it('empty goal → guidance', () => {
    expect(runDefaultAgent('   ').answer).toMatch(/give me a goal/i)
  })
})

describe('TC-17.1.4 — bounded loop + robustness', () => {
  it('stops at maxSteps even if the planner always asks for a tool', () => {
    const greedy: Planner = {
      plan: () => ({ kind: 'tool', reason: 'again', call: { tool: 'calc', input: '1+1' } }),
    }
    const registry = new ToolRegistry().add(calcTool)
    const result = runAgent('loop', greedy, registry, 3)
    expect(result.steps.filter((s) => s.phase === 'act')).toHaveLength(3) // bounded
    expect(result.answer).toBe('2')
  })
  it('an unknown tool is observed, not thrown', () => {
    const planner: Planner = {
      plan: () => ({ kind: 'tool', reason: 'try', call: { tool: 'nope', input: 'x' } }),
    }
    const result = runAgent('x', planner, new ToolRegistry(), 1)
    expect(result.answer).toContain('No such worker: nope')
  })
})

describe('RulefulPlanner routing', () => {
  const p = new RulefulPlanner()
  it('routes "what is 2 + 2" to calc (extracts the expression)', () => {
    const d = p.plan('what is 2 + 2', [])
    expect(d.kind === 'tool' && d.call.tool === 'calc' && d.call.input).toBe('2 + 2')
  })
  it('routes a prose question to search', () => {
    const d = p.plan('explain recursion', [])
    expect(d.kind === 'tool' && d.call.tool).toBe('search')
  })
})
