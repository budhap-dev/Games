import { useStore } from './store'

let ctx: AudioContext | null = null
const getCtx = () => {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.15, when = 0) {
  if (!useStore.getState().sound) return
  try {
    const c = getCtx()
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.setValueAtTime(0.0001, c.currentTime + when)
    g.gain.exponentialRampToValueAtTime(gain, c.currentTime + when + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur)
    o.connect(g).connect(c.destination)
    o.start(c.currentTime + when)
    o.stop(c.currentTime + when + dur + 0.02)
  } catch {
    /* audio unavailable */
  }
}

export const sfx = {
  /** Unlock audio on first user gesture (iOS). */
  unlock: () => {
    try { getCtx() } catch { /* ignore */ }
  },
  tap: () => tone(520, 0.06, 'triangle', 0.08),
  pop: () => { tone(660, 0.08, 'sine', 0.12); tone(990, 0.1, 'sine', 0.08, 0.05) },
  flip: () => tone(440, 0.07, 'triangle', 0.08),
  good: () => { tone(523, 0.1, 'triangle'); tone(659, 0.1, 'triangle', 0.15, 0.1); tone(784, 0.18, 'triangle', 0.15, 0.2) },
  bad: () => { tone(300, 0.14, 'sawtooth', 0.06); tone(220, 0.2, 'sawtooth', 0.06, 0.12) },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.14, i * 0.11)) },
  lose: () => { tone(392, 0.15, 'sine', 0.12); tone(330, 0.25, 'sine', 0.12, 0.15) },
}
