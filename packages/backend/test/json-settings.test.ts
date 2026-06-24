import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { JsonSettings } from '../src/adapters/settings/json-settings.adapter'

let dir: string
let file: string
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'saathi-set-'))
  file = join(dir, 'settings.json')
})
afterEach(() => rmSync(dir, { recursive: true, force: true }))

describe('TC-20.1.1 — JsonSettings defaults / set / persist', () => {
  it('returns sensible defaults on first run', () => {
    expect(new JsonSettings(file).get()).toEqual({
      userName: '',
      llmMode: 'offline',
      runMode: 'lite',
      embedding: 'local',
      cloudProvider: 'openai',
      searchProvider: 'none',
      onboarded: false,
    })
  })

  it('set merges a patch and leaves other fields intact', () => {
    const s = new JsonSettings(file)
    const next = s.set({ userName: 'Gunjan', llmMode: 'cloud' })
    expect(next.userName).toBe('Gunjan')
    expect(next.llmMode).toBe('cloud')
    expect(next.searchProvider).toBe('none') // unchanged
  })

  it('persists across instances', () => {
    new JsonSettings(file).set({ userName: 'Gunjan', onboarded: true })
    expect(new JsonSettings(file).get()).toMatchObject({ userName: 'Gunjan', onboarded: true })
  })

  it('a corrupt file → defaults, no throw', () => {
    writeFileSync(file, '{{ not json')
    let s: JsonSettings
    expect(() => (s = new JsonSettings(file))).not.toThrow()
    expect(s!.get().llmMode).toBe('offline')
  })
})
