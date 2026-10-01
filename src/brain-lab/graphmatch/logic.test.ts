import { describe, it, expect } from 'vitest'
import { formula, makeRound, roundPoints, same, stops, yAt } from './logic'
import { seeded } from '@/shared/random'

describe('graph match', () => {
  it('evaluates lines and parabolas', () => {
    expect(yAt('line', { a: 2, b: -3, c: 0 }, 4)).toBe(5)
    expect(yAt('parabola', { a: -1, b: 2, c: 3 }, 2)).toBe(3)
    expect(yAt('parabola', { a: 0.5, b: -1, c: 0 }, 1)).toBe(2)
  })
  it('writes formulas the way a maths book would', () => {
    expect(formula('line', { a: 2, b: -3, c: 0 })).toBe('y = 2x − 3')
    expect(formula('line', { a: -1, b: 0, c: 0 })).toBe('y = −x')
    expect(formula('line', { a: 0.5, b: 4, c: 0 })).toBe('y = 0.5x + 4')
    expect(formula('parabola', { a: -0.5, b: -2, c: 1 })).toBe('y = −0.5(x + 2)² + 1')
    expect(formula('parabola', { a: 1, b: 0, c: 0 })).toBe('y = x²')
  })
  it('targets are reachable with the sliders and differ from the start', () => {
    const rnd = seeded(5)
    for (const d of ['easy', 'normal', 'hard'] as const) for (let k = 0; k < 40; k++) {
      const r = makeRound(d, rnd)
      expect(same(r.target, r.start)).toBe(false)
      for (const s of r.sliders) expect(stops(s)).toContain(r.target[s.key])
    }
  })
  it('faster is worth more', () => {
    expect([roundPoints(5), roundPoints(20), roundPoints(90)]).toEqual([10, 7, 5])
  })
})
