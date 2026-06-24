// The ONLY file allowed to import pyodide (Wrapper Rule / vendor-only-in-adapter).
// Runs in the MAIN process (ADR-0006) — never the renderer — so there is no
// renderer CSP relaxation. Lazy singleton: CPython (WASM) loads once on first run.
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { loadPyodide, type PyodideInterface } from 'pyodide'
import type { PyRunPort, PyRunResult } from '../../ports/py-run.port'

// Resolve Pyodide's asset dir explicitly (lock file, stdlib zip, .wasm). Auto-detection
// breaks once the module is bundled/transformed, so we point indexURL at the package.
const require = createRequire(import.meta.url)
const PYODIDE_DIR = dirname(require.resolve('pyodide'))

/** Real Python execution behind `PyRunPort`, via Pyodide. Errors are reported, never thrown. */
export class PyodideRun implements PyRunPort {
  private static loader: Promise<PyodideInterface> | undefined

  private static get(): Promise<PyodideInterface> {
    PyodideRun.loader ??= loadPyodide({ indexURL: PYODIDE_DIR })
    return PyodideRun.loader
  }

  async run(code: string): Promise<PyRunResult> {
    let output = ''
    try {
      const py = await PyodideRun.get()
      py.setStdout({ batched: (s: string) => (output += s + '\n') })
      py.setStderr({ batched: (s: string) => (output += s + '\n') })
      await py.runPythonAsync(code)
      return { ok: true, output: output.replace(/\n+$/, '') }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e)
      return { ok: false, output: (output + err).trim() }
    }
  }
}
