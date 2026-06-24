/**
 * Agent tools — the "workers". Each is a pure function the supervisor can call.
 * Per the narrator principle, the tools compute the truth: `calc` uses the M2
 * formula engine (no `eval`); `search` answers from a knowledge corpus
 * (extractive + cited). The supervisor only routes to them and phrases the result.
 */
import { evalFormula, FormulaError } from '../sheet/formula'
import { Corpus, retrieve, composeAnswer } from '../knowledge/knowledge'

export interface Tool {
  name: string
  description: string
  run(input: string): string
}

/** A name → tool map. */
export class ToolRegistry {
  private readonly tools = new Map<string, Tool>()
  add(tool: Tool): this {
    this.tools.set(tool.name, tool)
    return this
  }
  get(name: string): Tool | undefined {
    return this.tools.get(name)
  }
  list(): Tool[] {
    return [...this.tools.values()]
  }
}

/** calc — exact arithmetic via the formula engine. Bad input → an error value, no throw. */
export const calcTool: Tool = {
  name: 'calc',
  description: 'Evaluate an arithmetic expression: + - * / ( ), and SUM/AVERAGE/MIN/MAX.',
  run(input: string): string {
    try {
      const body = input.trim().replace(/^=/, '')
      const n = evalFormula(body, () => {
        throw new FormulaError('#REF')
      })
      return String(n)
    } catch (e) {
      return e instanceof FormulaError ? e.code : '#ERR'
    }
  },
}

const GLOSSARY: ReadonlyArray<{ id: string; title: string; text: string }> = [
  {
    id: 'g-photosynthesis',
    title: 'Photosynthesis',
    text:
      'Photosynthesis is the process by which green plants convert sunlight, water, and carbon dioxide into chemical energy and oxygen. ' +
      'Chlorophyll in the leaves absorbs the light that powers the reaction.',
  },
  {
    id: 'g-saathi',
    title: 'Saathi',
    text:
      'Saathi is a local-first AI workspace. Your chats, documents, and browsing stay on your machine. ' +
      'It includes Chat, Office, Knowledge, Learn, and a private Browser with ad and tracker blocking.',
  },
  {
    id: 'g-http',
    title: 'HTTP',
    text:
      'HTTP, the HyperText Transfer Protocol, is how web browsers and servers exchange pages and data. ' +
      'HTTPS is the encrypted version that protects the connection from eavesdroppers.',
  },
  {
    id: 'g-recursion',
    title: 'Recursion',
    text:
      'Recursion is when a function calls itself to solve a smaller version of a problem, stopping at a base case. ' +
      'It is common in algorithms over trees and lists.',
  },
]

/** A small built-in knowledge base for the search tool. */
export function defaultCorpus(): Corpus {
  const corpus = new Corpus()
  for (const entry of GLOSSARY) corpus.add(entry)
  return corpus
}

/** search — a grounded, cited answer from a knowledge corpus (the seeded one by default). */
export function makeSearchTool(corpus: Corpus = defaultCorpus()): Tool {
  return {
    name: 'search',
    description: 'Answer a question from the knowledge base, grounded in a source.',
    run(query: string): string {
      const hits = retrieve(corpus, query, 3)
      const { answer, citations } = composeAnswer(query, hits)
      return citations.length > 0 ? `${answer} (source: ${citations[0].docTitle})` : answer
    },
  }
}

export function builtinTools(): Tool[] {
  return [calcTool, makeSearchTool()]
}
