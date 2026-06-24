import type { ShieldsState } from '@saathi/shared'

/**
 * Shields state — pure. Tracks whether ad/tracker blocking is on and how many
 * requests it has blocked this session. The host engine does the matching; this
 * is our tally + toggle (the UI only reflects it).
 */
export class Shields {
  private enabled = true
  private blocked = 0

  setEnabled(value: boolean): void {
    this.enabled = value
  }
  /** Flip on/off; returns the new state. */
  toggle(): boolean {
    this.enabled = !this.enabled
    return this.enabled
  }
  /** Count blocked requests — only while enabled (blocking is off otherwise). */
  recordBlocked(n = 1): void {
    if (this.enabled) this.blocked += n
  }
  state(): ShieldsState {
    return { enabled: this.enabled, blocked: this.blocked }
  }
}
