import { describe, it, expect } from 'vitest'
import { makeQuestion } from './logic'
import { seeded } from '@/shared/random'

describe('quick maths', () => {
  it('builds valid questions with 4 unique non-negative options including the answer', () => {
    const rnd = seeded(11)
    for (const d of ['easy', 'normal', 'hard'] as const) for (let i = 0; i < 60; i++) {
      const q = makeQuestion(d, rnd)
      expect(q.options.length).toBe(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.options).toContain(q.answer)
      expect(q.answer).toBeGreaterThanOrEqual(0)
      for (const o of q.options) expect(o).toBeGreaterThanOrEqual(0)
      if (d === 'easy') expect(q.answer).toBeLessThanOrEqual(10)
    }
  })
})
