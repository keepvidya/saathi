/**
 * Skills — reusable recipes that turn a small input into an agent goal, composing
 * the real worker tools (calc / search). Each skill is a deterministic template
 * (our code); running it routes through the M10a agent, so the answer is computed,
 * not invented. (User-defined / learned skills are a future enhancement.)
 */
import { runDefaultAgent, type AgentResult } from './react'

export interface Skill {
  id: string
  name: string
  description: string
  /** what to type, shown as the input placeholder */
  inputLabel: string
  example: string
  /** build an agent goal from the user's input (pure) */
  toGoal(input: string): string
}

const nums = (s: string): number[] => (s.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)

export const BUILTIN_SKILLS: Skill[] = [
  {
    id: 'calc',
    name: 'Calculator',
    description: 'Evaluate any arithmetic expression — exactly.',
    inputLabel: 'Expression',
    example: '12.5 * (8 + 4)',
    toGoal: (input) => input.trim(),
  },
  {
    id: 'define',
    name: 'Look up',
    description: 'Define or explain a term from the knowledge base.',
    inputLabel: 'Term or question',
    example: 'HTTP',
    toGoal: (input) => `what is ${input.trim()}?`,
  },
  {
    id: 'percent',
    name: 'Percentage',
    description: 'Find X% of a number.',
    inputLabel: 'e.g. 15% of 240',
    example: '15% of 240',
    toGoal: (input) => {
      const [pct, base] = nums(input)
      return pct != null && base != null ? `(${base} * ${pct} / 100)` : input.trim()
    },
  },
  {
    id: 'tip',
    name: 'Tip splitter',
    description: 'Split a bill (with tip) across people.',
    inputLabel: 'bill, people, tip%',
    example: '120, 4, 18',
    toGoal: (input) => {
      const [bill, people, tip = 0] = nums(input)
      return people ? `(${bill} * (1 + ${tip} / 100)) / ${people}` : input.trim()
    },
  },
  {
    id: 'avg',
    name: 'Average',
    description: 'Average a list of numbers.',
    inputLabel: 'comma-separated numbers',
    example: '10, 20, 30',
    toGoal: (input) => {
      const list = nums(input)
      return list.length > 0 ? `AVERAGE(${list.join(',')})` : input.trim()
    },
  },
]

/** A name → skill catalogue. */
export class SkillRegistry {
  private readonly skills = new Map<string, Skill>()
  constructor(skills: Skill[] = BUILTIN_SKILLS) {
    for (const s of skills) this.skills.set(s.id, s)
  }
  get(id: string): Skill | undefined {
    return this.skills.get(id)
  }
  list(): Skill[] {
    return [...this.skills.values()]
  }
}

/** Run a skill: build its goal and route it through the deterministic agent. */
export function runSkill(skill: Skill, input: string): AgentResult {
  return runDefaultAgent(skill.toGoal(input))
}
