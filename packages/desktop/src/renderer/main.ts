import { loadSkin, mountShell, bridge } from '@saathi/frontend'

// The host's renderer is intentionally thin: it just mounts the frontend package
// and wires the secure bridge round-trip. All UI lives in @saathi/frontend.
loadSkin()
const root = document.getElementById('app')
if (root) mountShell(root)

bridge
  .getAppInfo()
  .then((info) => (document.title = `${info.name} v${info.version}`))
  .catch(() => {})
