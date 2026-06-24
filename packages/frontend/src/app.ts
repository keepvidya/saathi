import { mountShell } from './shell/shell'
import { renderOnboarding } from './onboarding/onboarding'
import { bridge } from './bridge/saathi.bridge'

/**
 * App bootstrap: on first run (packaged build, not yet onboarded) show the
 * onboarding wizard, then the shell; otherwise the shell directly.
 */
export async function startApp(root: HTMLElement): Promise<void> {
  let first = false
  try {
    first = await bridge.firstRun()
  } catch {
    first = false
  }
  if (first) {
    renderOnboarding(root, { onDone: () => mountShell(root) })
  } else {
    mountShell(root)
  }
}
