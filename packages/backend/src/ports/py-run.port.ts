import type { PyRunResult } from '@saathi/shared'

export type { PyRunResult }

/** Outbound port: run Python code and return its output (for runnable lessons). */
export interface PyRunPort {
  run(code: string): Promise<PyRunResult>
}
