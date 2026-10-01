import { describe, it, expect } from 'vitest'
import { grade, makeRound, valueAt } from './logic'
import { seeded } from '@/shared/random'

describe('number line', () => {
  it('targets sit inside the line and never on a written label', () => {
    const rnd = seeded(2)
    for (const d of ['easy', 'normal', 'hard'] as const) for (let k = 0; k < 60; k++) {
      const r = makeRound(d, rnd)
      expect(r.target).toBeGreaterThan(r.min); expect(r.target).toBeLessThan(r.max)
      expect(r.labels).not.toContain(r.target)
    }
  })
  it('easy snaps to whole numbers and must be exact', () => {
    const r = { min: 0, max: 10, target: 7, label: '7', tick: 1, labels: [0, 5, 10], snap: true }
    expect(valueAt(r, 0.68)).toBe(7)
    expect([grade(r, 7), grade(r, 6), grade(r, 4)]).toEqual([3, 1, 0])
  })
  it('grades by distance on longer lines', () => {
    const r = { min: 0, max: 100, target: 37, label: '37', tick: 10, labels: [0, 50, 100], snap: false }
    expect([grade(r, 38), grade(r, 41), grade(r, 45), grade(r, 60)]).toEqual([3, 2, 1, 0])
    expect(valueAt(r, 1.4)).toBe(100)
  })
})
