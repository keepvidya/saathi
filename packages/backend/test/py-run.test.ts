// @vitest-environment node
// Pyodide detects its host; force the Node environment (not jsdom) so it loads via fs.
import { describe, expect, it } from 'vitest'
import { PyodideRun } from '../src/adapters/pyodide/py-run.adapter'

describe('TC-14.1 — Pyodide runs Python (backend, main-process runtime)', () => {
  const py = new PyodideRun()

  it('TC-14.1.1 — captures stdout from a successful run', async () => {
    const r = await py.run('print("hi"); print(2**10)')
    expect(r.ok).toBe(true)
    expect(r.output).toContain('hi')
    expect(r.output).toContain('1024')
  }, 60000)

  it('TC-14.1.2 — reports a Python error instead of throwing', async () => {
    const r = await py.run('1/0')
    expect(r.ok).toBe(false)
    expect(r.output).toContain('ZeroDivisionError')
  }, 60000)

  it('TC-14.1.2 — empty code is a clean no-op', async () => {
    const r = await py.run('')
    expect(r.ok).toBe(true)
    expect(r.output).toBe('')
  }, 60000)
})
