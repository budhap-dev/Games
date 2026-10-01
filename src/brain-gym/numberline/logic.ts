import { pick, randInt } from '@/shared/random'
import type { Difficulty } from '@/shared/store'

export interface LineRound {
  min: number; max: number
  target: number; label: string
  /** Gap between tick marks, and which numbers are written under the line */
  tick: number; labels: number[]
  /** Easy snaps guesses to whole numbers */
  snap: boolean
}

const FRACTIONS: [number, string][] = [
  [0.25, '¼'], [0.5, '½'], [0.75, '¾'], [1.25, '1¼'], [1.5, '1½'], [1.75, '1¾'], [1 / 3, '⅓'], [2 / 3, '⅔'], [4 / 3, '1⅓'],
  [0.1, '0.1'], [0.2, '0.2'], [0.4, '0.4'], [0.6, '0.6'], [0.8, '0.8'], [1.2, '1.2'], [1.6, '1.6'], [1.9, '1.9'],
]

export function makeRound(d: Difficulty, rnd: () => number = Math.random): LineRound {
  if (d === 'easy') {
    const target = pick([1, 2, 3, 4, 6, 7, 8, 9], rnd)
    return { min: 0, max: 10, target, label: String(target), tick: 1, labels: [0, 5, 10], snap: true }
  }
  if (d === 'normal') {
    let target = 1 + randInt(99, rnd)
    if (target % 10 === 0) target += 3
    return { min: 0, max: 100, target, label: String(target), tick: 10, labels: [0, 50, 100], snap: false }
  }
  const [target, label] = pick(FRACTIONS, rnd)
  return { min: 0, max: 2, target, label, tick: 0.5, labels: [0, 1, 2], snap: false }
}

/** Value at a fraction (0..1) of the way along the line. */
export function valueAt(r: LineRound, frac: number): number {
  const v = r.min + Math.max(0, Math.min(1, frac)) * (r.max - r.min)
  return r.snap ? Math.round(v) : v
}

/** 0–3 stars: Easy must be exact (1 star for one off); others by distance as a share of the line. */
export function grade(r: LineRound, guess: number): number {
  if (r.snap) { const e = Math.abs(Math.round(guess) - r.target); return e === 0 ? 3 : e === 1 ? 1 : 0 }
  const e = Math.abs(guess - r.target) / (r.max - r.min)
  return e <= 0.02 ? 3 : e <= 0.05 ? 2 : e <= 0.1 ? 1 : 0
}
