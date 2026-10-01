import { pick } from '@/shared/random'
import type { Difficulty } from '@/shared/store'

export type Kind = 'line' | 'parabola'
/** line: y = a·x + b   ·   parabola: y = a·(x − b)² + c */
export interface Params { a: number; b: number; c: number }
export interface Slider { key: keyof Params; label: string; min: number; max: number; step: number }
export interface GraphRound { kind: Kind; target: Params; start: Params; sliders: Slider[] }

const SETUP: Record<Difficulty, { kind: Kind; sliders: Slider[] }> = {
  easy: { kind: 'line', sliders: [{ key: 'a', label: 'slope m', min: -3, max: 3, step: 1 }, { key: 'b', label: 'intercept c', min: -4, max: 4, step: 1 }] },
  normal: { kind: 'line', sliders: [{ key: 'a', label: 'slope m', min: -3, max: 3, step: 0.5 }, { key: 'b', label: 'intercept c', min: -5, max: 5, step: 1 }] },
  hard: { kind: 'parabola', sliders: [{ key: 'a', label: 'stretch a', min: -2, max: 2, step: 0.5 }, { key: 'b', label: 'shift h', min: -4, max: 4, step: 1 }, { key: 'c', label: 'lift k', min: -5, max: 5, step: 1 }] },
}

export const yAt = (kind: Kind, p: Params, x: number) => (kind === 'line' ? p.a * x + p.b : p.a * (x - p.b) ** 2 + p.c)
export const same = (p: Params, q: Params) => (['a', 'b', 'c'] as const).every((k) => Math.abs(p[k] - q[k]) < 1e-9)
export const stops = (s: Slider) => Array.from({ length: Math.round((s.max - s.min) / s.step) + 1 }, (_, i) => +(s.min + i * s.step).toFixed(2))

export function makeRound(d: Difficulty, rnd: () => number = Math.random): GraphRound {
  const { kind, sliders } = SETUP[d]
  const start: Params = { a: 1, b: 0, c: 0 }
  for (;;) {
    const target: Params = { a: 0, b: 0, c: 0 }
    for (const s of sliders) target[s.key] = pick(stops(s), rnd)
    if (target.a !== 0 && !same(target, start)) return { kind, target, start, sliders }
  }
}

const num = (n: number) => (Number.isInteger(n) ? String(Math.abs(n)) : Math.abs(n).toFixed(1))
const signed = (n: number) => (n === 0 ? '' : ` ${n < 0 ? '−' : '+'} ${num(n)}`)
const coef = (n: number) => (n === 1 ? '' : n === -1 ? '−' : `${n < 0 ? '−' : ''}${num(n)}`)

/** Human formula, e.g. "y = 2x − 3" or "y = −0.5(x + 2)² + 1". */
export function formula(kind: Kind, p: Params): string {
  if (kind === 'line') return p.a === 0 ? `y = ${p.b < 0 ? '−' : ''}${num(p.b)}` : `y = ${coef(p.a)}x${signed(p.b)}`
  if (p.a === 0) return `y = ${p.c < 0 ? '−' : ''}${num(p.c)}`
  const inner = p.b === 0 ? 'x²' : `(x${signed(-p.b)})²`
  return `y = ${coef(p.a)}${inner}${signed(p.c)}`
}

/** Faster matches score more. */
export const roundPoints = (seconds: number) => (seconds < 15 ? 10 : seconds < 30 ? 7 : 5)
