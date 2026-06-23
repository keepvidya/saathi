import { describe, expect, it } from 'vitest'
import { runBuild, type BuildPhase } from '../src/agent/build'
import { TemplateLlm, type LlmPort } from '../src/agent/llm'
import { validateDeck, validateDoc, validateSheet } from '../src/agent/validators'

const tmpl = new TemplateLlm()
const phases = (steps: { phase: BuildPhase }[]) => steps.map((s) => s.phase)

describe('TC-05.1.1 — build slides: valid + ReAct steps', () => {
  it('produces a valid deck and ordered ReAct phases', async () => {
    const r = await runBuild({ type: 'slides', brief: 'Q3 results' }, tmpl)
    expect(r.valid).toBe(true)
    expect(r.deck && validateDeck(r.deck)).toBeNull()
    const seq = phases(r.steps)
    for (const p of ['reason', 'act', 'observe', 'validate', 'done'] as BuildPhase[]) {
      expect(seq).toContain(p)
    }
    // ordering: reason before act before validate before done
    expect(seq.indexOf('reason')).toBeLessThan(seq.indexOf('act'))
    expect(seq.indexOf('act')).toBeLessThan(seq.indexOf('validate'))
    expect(seq.lastIndexOf('validate')).toBeLessThan(seq.lastIndexOf('done'))
  })
})

describe('TC-05.1.2 — sheets & docs builds are valid', () => {
  it('sheet total computes; doc has heading + body', async () => {
    const s = await runBuild({ type: 'sheets', brief: 'Budget', numbers: [10, 20, 30] }, tmpl)
    expect(s.valid).toBe(true)
    expect(s.sheet && validateSheet(s.sheet, 'B5')).toBeNull() // 3 items → total at B5

    const d = await runBuild({ type: 'docs', brief: 'Proposal' }, tmpl)
    expect(d.valid).toBe(true)
    expect(d.doc && validateDoc(d.doc)).toBeNull()
  })
})

describe('TC-05.1.3 — numbers are COMPUTED, not invented', () => {
  it('cites the engine-computed SUM in a slide bullet', async () => {
    const r = await runBuild({ type: 'slides', brief: 'Q3', numbers: [120, 150, 177] }, tmpl)
    const flat = r.deck!.slides.flatMap((s) => s.bullets).join(' | ')
    expect(flat).toContain('Total: 447')

    const r2 = await runBuild({ type: 'slides', brief: 'Q3', numbers: [1, 2, 3] }, tmpl)
    expect(r2.deck!.slides.flatMap((s) => s.bullets).join(' | ')).toContain('Total: 6')
  })
})

describe('TC-05.1.4 — self-correction is bounded', () => {
  it('fixes empty bullets and reports valid, with a bounded number of fixes', async () => {
    const emptyLlm: LlmPort = { narrate: async () => [''] } // narrator returns blank lines
    const fixSteps: string[] = []
    const r = await runBuild({ type: 'slides', brief: 'Edge' }, emptyLlm, (s) => {
      if (s.phase === 'fix') fixSteps.push(s.text)
    })
    expect(fixSteps.length).toBeGreaterThan(0)
    expect(fixSteps.length).toBeLessThanOrEqual(2) // never loops
    expect(r.valid).toBe(true)
    expect(validateDeck(r.deck!)).toBeNull()
  })
})

describe('TemplateLlm is deterministic', () => {
  it('same prompt → same lines', async () => {
    const a = await tmpl.narrate({ task: 'x', n: 3 })
    const b = await tmpl.narrate({ task: 'x', n: 3 })
    expect(a).toEqual(b)
    expect(a.length).toBe(3)
  })
  it('uses defaults (n=3, generic topic) for empty input', async () => {
    const a = await tmpl.narrate({ task: '' })
    expect(a.length).toBe(3)
    expect(a[0]).toContain('the topic')
    expect((await tmpl.narrate({ task: 'y', n: 1 })).length).toBe(1)
  })
})

describe('build resilience', () => {
  it('docs build with an empty narrator still yields a valid doc (fallback prose)', async () => {
    const empty: LlmPort = { narrate: async () => [] }
    const r = await runBuild({ type: 'docs', brief: 'X' }, empty)
    expect(r.valid).toBe(true)
    expect(validateDoc(r.doc!)).toBeNull()
  })
})
