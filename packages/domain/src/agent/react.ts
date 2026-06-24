/**
 * The ReAct agent: a bounded reason → act → observe → answer loop. A `Planner`
 * (the supervisor) decides each step — a worker tool call or a final answer; the
 * loop runs the tool and feeds the observation back. The structure is our code;
 * the default planner routes deterministically (a model could narrate later).
 */
import { ToolRegistry, builtinTools } from './tools'

export interface AgentStep {
  phase: 'reason' | 'act' | 'observe' | 'answer'
  agent: string
  text: string
}

export interface AgentResult {
  steps: AgentStep[]
  answer: string
}

export interface ToolCall {
  tool: string
  input: string
}

export type PlanDecision =
  | { kind: 'tool'; reason: string; call: ToolCall }
  | { kind: 'final'; reason: string; answer: string }

export interface Planner {
  plan(goal: string, observations: string[]): PlanDecision
}

const QUESTION = /\b(what|whats|who|why|how|when|where|which|find|search|explain|define|tell)\b/i

/** Strip leading command words so the rest can be tested as a calc expression. */
function exprOf(goal: string): string {
  return goal
    .replace(/^\s*(please\s+)?(calculate|compute|eval(uate)?|what\s+is|whats)\s*/i, '')
    .replace(/[?.!]+$/, '')
    .trim()
}

/** A pure arithmetic expression: numbers + operators (+ SUM/AVG/…), no real words. */
function isMath(expr: string): boolean {
  if (!/[0-9]/.test(expr)) return false
  if (!/[-+*/]|\b(sum|average|min|max|count)\s*\(/i.test(expr)) return false
  const words = expr.replace(/\b(sum|average|min|max|count)\b/gi, '')
  return /^[\s\d.,+\-*/()]*$/.test(words)
}

/** Deterministic supervisor routing: math → calc, questions → search, else a default. */
export class RulefulPlanner implements Planner {
  plan(goal: string, observations: string[]): PlanDecision {
    // Single-tool tasks: once a worker has answered, finalise with its result.
    if (observations.length > 0) {
      return {
        kind: 'final',
        reason: 'The worker returned a result — using it as the answer.',
        answer: observations[observations.length - 1],
      }
    }
    const g = goal.trim()
    if (g === '') {
      return {
        kind: 'final',
        reason: 'No goal was given.',
        answer: 'Give me a goal — e.g. “12.5 * (8 + 4)” or “what is photosynthesis?”.',
      }
    }
    const expr = exprOf(g)
    if (isMath(expr)) {
      return {
        kind: 'tool',
        reason: `That’s a calculation — delegating to the calc worker: ${expr}`,
        call: { tool: 'calc', input: expr },
      }
    }
    if (QUESTION.test(g) || g.endsWith('?')) {
      return {
        kind: 'tool',
        reason: 'A knowledge question — delegating to the search worker.',
        call: { tool: 'search', input: g },
      }
    }
    return {
      kind: 'final',
      reason: 'No worker is needed for this.',
      answer:
        'I can calculate (e.g. “(240*0.15)+30”) and answer questions from the knowledge base (e.g. “what is HTTP?”).',
    }
  }
}

/** Run the bounded ReAct loop, recording every step. */
export function runAgent(
  goal: string,
  planner: Planner,
  registry: ToolRegistry,
  maxSteps = 5,
): AgentResult {
  const steps: AgentStep[] = []
  const observations: string[] = []

  for (let i = 0; i < maxSteps; i++) {
    const decision = planner.plan(goal, observations)
    steps.push({ phase: 'reason', agent: 'Supervisor', text: decision.reason })

    if (decision.kind === 'final') {
      steps.push({ phase: 'answer', agent: 'Supervisor', text: decision.answer })
      return { steps, answer: decision.answer }
    }

    const tool = registry.get(decision.call.tool)
    steps.push({ phase: 'act', agent: decision.call.tool, text: decision.call.input })
    const output = tool ? tool.run(decision.call.input) : `No such worker: ${decision.call.tool}`
    observations.push(output)
    steps.push({ phase: 'observe', agent: decision.call.tool, text: output })
  }

  const answer = observations[observations.length - 1] ?? 'I couldn’t complete that within the step budget.'
  steps.push({ phase: 'answer', agent: 'Supervisor', text: answer })
  return { steps, answer }
}

/** The default tool registry (calc + search). */
export function defaultRegistry(): ToolRegistry {
  const registry = new ToolRegistry()
  for (const tool of builtinTools()) registry.add(tool)
  return registry
}

/** Convenience: run the deterministic agent with the default tools. */
export function runDefaultAgent(goal: string): AgentResult {
  return runAgent(goal, new RulefulPlanner(), defaultRegistry())
}
