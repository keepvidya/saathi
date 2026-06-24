/**
 * Read-aloud seam. Web Speech is a browser built-in (not an npm vendor), but we
 * still wrap it behind a port: it keeps the Learn pane testable and lets us swap
 * in Piper TTS later (M8b) without touching the pane.
 */
export interface SpeechPort {
  speak(text: string): void
  stop(): void
}

/** Real read-aloud via the browser's SpeechSynthesis. */
export class WebSpeech implements SpeechPort {
  speak(text: string): void {
    const synth = globalThis.speechSynthesis
    synth.cancel() // never overlap with a previous utterance
    synth.speak(new SpeechSynthesisUtterance(text))
  }
  stop(): void {
    globalThis.speechSynthesis.cancel()
  }
}

/** No-op fallback where speech isn't available (tests, unsupported environments). */
export class SilentSpeech implements SpeechPort {
  speak(): void {}
  stop(): void {}
}

/** Feature-detects SpeechSynthesis; returns the real adapter or the silent one. */
export function makeSpeech(): SpeechPort {
  const hasSpeech =
    typeof globalThis !== 'undefined' &&
    'speechSynthesis' in globalThis &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  return hasSpeech ? new WebSpeech() : new SilentSpeech()
}
