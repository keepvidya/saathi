import { contextBridge, ipcRenderer } from 'electron'
import { buildApi } from './build-api'

/**
 * Expose a typed, minimal, validated surface to the renderer (ENGINEERING-PROTOCOL §9).
 * The renderer never sees ipcRenderer; only `window.saathi`.
 */
const api = buildApi((channel, ...args) => ipcRenderer.invoke(channel, ...args))

contextBridge.exposeInMainWorld('saathi', api)
