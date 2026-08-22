import { describe, it, expect } from 'vitest'
import { makeOddRound } from './logic'
import { seeded } from '@/shared/random'

describe('odd one out', () => {
  it('produces n unique items with exactly one odd', () => {
    const rnd = seeded(3)
    for (const [d, n] of [['easy', 4], ['normal', 6], ['hard', 8]] as const) {
      for (let i = 0; i < 30; i++) {
        const r = makeOddRound(d, rnd)
        expect(r.items.length).toBe(n)
        expect(new Set(r.items).size).toBe(n)
        expect(r.items.filter((x) => x === r.odd).length).toBe(1)
      }
    }
  })
})
