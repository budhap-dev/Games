import { describe, it, expect } from 'vitest'
import { FIGURES, PIECES, area, snaps } from './logic'

describe('tangram', () => {
  it('seven pieces tile the 4x4 square (areas sum to 16)', () => {
    expect(PIECES.length).toBe(7)
    expect(PIECES.reduce((s, p) => s + area(p.pts), 0)).toBeCloseTo(16)
  })
  it('every figure has a target for every piece', () => {
    for (const f of FIGURES) for (const p of PIECES) expect(f.targets[p.id]).toBeDefined()
  })
  it('snaps only near the target', () => {
    expect(snaps([0.2, -0.3], [0, 0])).toBe(true)
    expect(snaps([1, 0], [0, 0])).toBe(false)
  })
})
