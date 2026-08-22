import { describe, it, expect } from 'vitest'
import { makeRound } from './logic'
import { seeded } from '@/shared/random'

describe('what comes next', () => {
  it('always includes the answer among unique options', () => {
    const rnd = seeded(7)
    for (const d of ['easy', 'normal', 'hard'] as const) {
      for (let i = 0; i < 40; i++) {
        const r = makeRound(d, rnd)
        expect(r.options).toContain(r.answer)
        expect(new Set(r.options).size).toBe(r.options.length)
        expect(r.options.length).toBeGreaterThanOrEqual(3)
        expect(r.seq.length).toBeGreaterThanOrEqual(4)
      }
    }
  })
})
