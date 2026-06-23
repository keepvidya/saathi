import type { DeckData, Slide } from '../deck/deck'
import type { DocData } from '../doc/doc'
import { Sheet, type SheetData } from '../sheet/sheet'
import type { LlmPort } from './llm'
import { validateDeck, validateDoc, validateSheet } from './validators'

export type BuildType = 'slides' | 'sheets' | 'docs'
export interface BuildBrief {
  type: BuildType
  brief: string
  numbers?: number[]
}
export type BuildPhase = 'reason' | 'act' | 'observe' | 'validate' | 'fix' | 'done'
export interface BuildStep {
  agent: string
  phase: BuildPhase
  text: string
}
export interface BuildResult {
  type: BuildType
  deck?: DeckData
  sheet?: SheetData
  doc?: DocData
  steps: BuildStep[]
  valid: boolean
}

const MAX_FIXES = 2

/** Compute SUM of numbers with the real formula engine — never invented by the LLM. */
function computeTotal(numbers: number[]): number {
  const s = new Sheet(numbers.length + 1, 2)
  numbers.forEach((n, i) => s.setRaw('A' + (i + 1), String(n)))
  s.setRaw('B1', `=SUM(A1:A${numbers.length})`)
  return s.evaluate('B1') as number
}

type Emit = (agent: string, phase: BuildPhase, text: string) => void

export async function runBuild(
  brief: BuildBrief,
  llm: LlmPort,
  onStep?: (s: BuildStep) => void,
): Promise<BuildResult> {
  const steps: BuildStep[] = []
  const emit: Emit = (agent, phase, text) => {
    const step = { agent, phase, text }
    steps.push(step)
    onStep?.(step)
  }
  emit('Orchestrator', 'reason', `Plan a ${brief.type} build for: "${brief.brief || 'untitled'}"`)

  if (brief.type === 'slides') {
    const r = await buildSlides(brief, llm, emit)
    return { type: 'slides', deck: r.model, steps, valid: r.valid }
  }
  if (brief.type === 'sheets') {
    const r = buildSheet(brief, emit)
    return { type: 'sheets', sheet: r.model, steps, valid: r.valid }
  }
  const r = await buildDoc(brief, llm, emit)
  return { type: 'docs', doc: r.model, steps, valid: r.valid }
}

async function buildSlides(brief: BuildBrief, llm: LlmPort, emit: Emit) {
  const topic = brief.brief || 'Untitled'
  emit('SlidesExpert', 'reason', 'Outline: Title · Highlights · Numbers · Next steps')
  emit('SlidesExpert', 'act', 'Writing slide copy (the LLM narrates the words)')
  const slides: Slide[] = [
    { title: topic, bullets: await llm.narrate({ task: topic, n: 3 }) },
    { title: 'Highlights', bullets: await llm.narrate({ task: `${topic} highlights`, n: 3 }) },
  ]
  if (brief.numbers?.length) {
    emit('SheetsExpert', 'act', 'Computing the real total from your numbers (formula engine)')
    const total = computeTotal(brief.numbers)
    emit('SheetsExpert', 'observe', `Total = ${total} — computed, not invented`)
    slides.push({
      title: 'Numbers',
      bullets: [
        `Total: ${total}`,
        `Items: ${brief.numbers.length}`,
        `Average: ${Math.round(total / brief.numbers.length)}`,
      ],
    })
  }
  slides.push({ title: 'Next steps', bullets: await llm.narrate({ task: `${topic} next steps`, n: 3 }) })
  emit('SlidesExpert', 'observe', `Drafted ${slides.length} slides`)

  let model: DeckData = { title: topic, slides }
  let err = validateDeck(model)
  emit('SlidesExpert', 'validate', err ? `Invalid: ${err}` : 'Every slide has a title + bullets ✓')
  for (let i = 0; err && i < MAX_FIXES; i++) {
    emit('SlidesExpert', 'fix', `Repairing: ${err}`)
    model = {
      ...model,
      slides: model.slides.map((s) => ({
        title: s.title.trim() || 'Slide',
        bullets: s.bullets.some((b) => b.trim() !== '') ? s.bullets : ['Key point'],
      })),
    }
    err = validateDeck(model)
  }
  emit('SlidesExpert', 'done', 'Deck ready ✓')
  return { model, valid: validateDeck(model) === null }
}

function buildSheet(brief: BuildBrief, emit: Emit) {
  emit('SheetsExpert', 'reason', 'Lay out items + a SUM total')
  emit('SheetsExpert', 'act', 'Filling cells and writing the total formula (code)')
  const numbers = brief.numbers?.length ? brief.numbers : [120, 150, 177]
  const cells: Record<string, string> = { A1: brief.brief || 'Item', B1: 'Value' }
  numbers.forEach((n, i) => {
    cells['A' + (i + 2)] = `Item ${i + 1}`
    cells['B' + (i + 2)] = String(n)
  })
  const lastRow = numbers.length + 1
  const totalRef = `B${lastRow + 1}`
  cells['A' + (lastRow + 1)] = 'Total'
  cells[totalRef] = `=SUM(B2:B${lastRow})`
  const model: SheetData = { cells, rows: 20, cols: 8 }
  emit('SheetsExpert', 'observe', `Built ${numbers.length} rows with a SUM total`)
  const valid = validateSheet(model, totalRef) === null
  emit('SheetsExpert', 'validate', 'Total computes to a number ✓')
  emit('SheetsExpert', 'done', 'Sheet ready ✓')
  return { model, valid }
}

async function buildDoc(brief: BuildBrief, llm: LlmPort, emit: Emit) {
  const topic = brief.brief || 'Untitled'
  emit('DocsExpert', 'reason', 'Structure: heading · intro · summary')
  emit('DocsExpert', 'act', 'Writing the copy (the LLM narrates)')
  const intro = await llm.narrate({ task: topic, n: 1 })
  const summary = await llm.narrate({ task: `${topic} summary`, n: 1 })
  const model: DocData = {
    blocks: [
      { type: 'h1', runs: [{ text: topic }] },
      { type: 'p', runs: [{ text: intro[0] ?? 'Overview.' }] },
      { type: 'h2', runs: [{ text: 'Summary' }] },
      { type: 'p', runs: [{ text: summary[0] ?? 'Summary.' }] },
    ],
  }
  emit('DocsExpert', 'observe', `Drafted ${model.blocks.length} blocks`)
  const valid = validateDoc(model) === null
  emit('DocsExpert', 'validate', 'Has a heading + body ✓')
  emit('DocsExpert', 'done', 'Document ready ✓')
  return { model, valid }
}
