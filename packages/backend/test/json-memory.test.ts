import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { JsonMemory } from '../src/adapters/memory/json-memory.adapter'

let dir: string
let file: string
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'saathi-mem-'))
  file = join(dir, 'memory.json')
})
afterEach(() => rmSync(dir, { recursive: true, force: true }))

describe('TC-18.1.1 — remember', () => {
  it('stores text with an id + timestamp', () => {
    const item = new JsonMemory(file).remember('buy milk')
    expect(item.id).toBeTruthy()
    expect(item.text).toBe('buy milk')
    expect(item.createdAt).toBeGreaterThan(0)
  })
})

describe('TC-18.1.2 — recall ranks by relevance', () => {
  it('the matching note ranks first; respects the limit', () => {
    const mem = new JsonMemory(file)
    mem.remember('Income tax is a levy governments place on what people earn.')
    mem.remember('Photosynthesis lets green plants make energy from sunlight.')
    const hits = mem.recall('how do plants make energy', 5)
    expect(hits[0].text.toLowerCase()).toContain('photosynthesis')
    expect(mem.recall('plants', 1)).toHaveLength(1)
  })
})

describe('TC-18.1.3 — list + forget', () => {
  it('list is newest-first; forget removes one', () => {
    const mem = new JsonMemory(file)
    const a = mem.remember('first note')
    const b = mem.remember('second note')
    expect(mem.list().map((i) => i.id)).toEqual([b.id, a.id])
    mem.forget(a.id)
    expect(mem.list().map((i) => i.id)).toEqual([b.id])
    mem.forget('nope') // unknown id → no-op
    expect(mem.list()).toHaveLength(1)
  })
})

describe('TC-18.1.4 — persistence', () => {
  it('a new instance loads notes from disk', () => {
    new JsonMemory(file).remember('persisted note')
    const reopened = new JsonMemory(file)
    expect(reopened.list()[0].text).toBe('persisted note')
  })
  it('a corrupt file → starts empty, no throw', () => {
    writeFileSync(file, 'not json {{{')
    let mem: JsonMemory
    expect(() => (mem = new JsonMemory(file))).not.toThrow()
    expect(mem!.list()).toEqual([])
  })
})
