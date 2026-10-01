import { describe, it, expect } from 'vitest'
import { fewestBlocks, makeRound, stars, tilt, turning } from './logic'
import { seeded } from '@/shared/random'

describe('balance scale', () => {
  it('turning force is weight × distance', () => {
    expect(turning([{ d: 2, w: 3 }, { d: 1, w: 1 }])).toBe(7)
  })
  it('finds the fewest blocks', () => {
    expect(fewestBlocks(6, [1, 2, 3], 3)).toBe(1) // 2×3 or 3×2
    expect(fewestBlocks(10, [1, 2, 3], 3)).toBe(2) // 9 + 1
    expect(fewestBlocks(1, [2, 3], 5)).toBe(Infinity)
  })
  it('every round is solvable in at most 3 blocks', () => {
    const rnd = seeded(7)
    for (const d of ['easy', 'normal', 'hard'] as const) for (let k = 0; k < 50; k++) {
      const r = makeRound(d, rnd)
      expect(r.best).toBeLessThanOrEqual(3)
      expect(r.left.every((b) => b.d >= 1 && b.d <= r.pegs)).toBe(true)
    }
  })
  it('stars and tilt', () => {
    expect([stars(1, 1), stars(3, 1), stars(4, 1)]).toEqual([3, 2, 1])
    expect(tilt(6, 6)).toBe(0); expect(tilt(0, 50)).toBe(14); expect(tilt(4, 2)).toBe(-4)
  })
})
