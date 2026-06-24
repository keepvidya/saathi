// The ONLY file importing @ghostery/adblocker-electron (Wrapper Rule). The engine
// hooks Electron sessions, so it lives in the MAIN process (composition root) —
// not @saathi/backend, which is electron-free. Filters come from @saathi/domain
// so the same rule set is verified by the core engine in a unit test (no electron).
import { ElectronBlocker } from '@ghostery/adblocker-electron'
import { STARTER_FILTERS } from '@saathi/domain'
import type { Session } from 'electron'

/** Ad/tracker blocking for a session. `onBlocked` fires once per blocked request. */
export class AdBlock {
  private blocker: ElectronBlocker | undefined

  constructor(private readonly onBlocked: () => void) {}

  private engine(): ElectronBlocker {
    if (!this.blocker) {
      // Network rules only (no cosmetic/element-hiding) → no content-script injection.
      this.blocker = ElectronBlocker.parse(STARTER_FILTERS, { loadCosmeticFilters: false })
      this.blocker.on('request-blocked', this.onBlocked)
    }
    return this.blocker
  }

  enable(session: Session): void {
    this.engine().enableBlockingInSession(session)
  }

  disable(session: Session): void {
    this.blocker?.disableBlockingInSession(session)
  }
}
