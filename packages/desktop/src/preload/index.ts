import { contextBridge, ipcRenderer } from 'electron'
import { buildApi } from './build-api'

/**
 * Expose a typed, minimal, validated surface to the renderer (ENGINEERING-PROTOCOL §9).
 * The renderer never sees ipcRenderer; only `window.saathi`.
 */
const api = buildApi(
  (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  (channel, listener) => {
    // Strip the IpcRendererEvent; the renderer only sees the payload.
    const handler = (_e: unknown, ...args: unknown[]): void => listener(...args)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },
)

contextBridge.exposeInMainWorld('saathi', api)
