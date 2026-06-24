import { loadSkin, startApp, bridge } from '@saathi/frontend'

// The host's renderer is intentionally thin: it just boots the frontend package
// and wires the secure bridge round-trip. All UI lives in @saathi/frontend.
loadSkin()
const root = document.getElementById('app')
if (root) void startApp(root)

bridge
  .getAppInfo()
  .then((info) => (document.title = `${info.name} v${info.version}`))
  .catch(() => {})
