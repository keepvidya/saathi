import './styles.css'
import { loadSkin } from './theme/theme'
import { mountShell } from './shell/shell'
import { bridge } from './bridge/saathi.bridge'

// Standalone browser entry — the frontend runs without Electron (bridge falls back).
loadSkin()
const root = document.getElementById('app')
if (root) mountShell(root)
bridge
  .getAppInfo()
  .then((info) => (document.title = `${info.name} v${info.version}`))
  .catch(() => {})
