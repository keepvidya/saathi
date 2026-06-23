import type { SaathiApi } from './build-api'

declare global {
  interface Window {
    saathi: SaathiApi
  }
}

export {}
