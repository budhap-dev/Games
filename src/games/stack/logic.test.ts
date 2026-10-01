import { describe, it, expect } from 'vitest'
import { drop, slide } from './logic'

describe('stack tower', () => {
  it('snaps a near-perfect drop and keeps the width', () => {
    expect(drop({ x: 0.31, w: 0.4 }, { x: 0.3, w: 0.4 }, 0.02)).toEqual({ placed: { x: 0.3, w: 0.4 }, cut: null, perfect: true })
  })
  it('cuts the overhang on either side', () => {
    const right = drop({ x: 0.4, w: 0.4 }, { x: 0.3, w: 0.4 }, 0.01)
    expect(right.placed!.x).toBeCloseTo(0.4); expect(right.placed!.w).toBeCloseTo(0.3)
    expect(right.cut!.x).toBeCloseTo(0.7); expect(right.cut!.w).toBeCloseTo(0.1)
    const left = drop({ x: 0.2, w: 0.4 }, { x: 0.3, w: 0.4 }, 0.01)
    expect(left.placed!.x).toBeCloseTo(0.3); expect(left.placed!.w).toBeCloseTo(0.3)
    expect(left.cut!.x).toBeCloseTo(0.2); expect(left.cut!.w).toBeCloseTo(0.1)
  })
  it('misses when nothing overlaps', () => {
    expect(drop({ x: 0.7, w: 0.2 }, { x: 0.1, w: 0.2 }, 0.01).placed).toBeNull()
  })
  it('bounces off both edges', () => {
    expect(slide(0.55, 0.4, 1, 1, 0.1)).toEqual({ x: expect.closeTo(0.55, 5), dir: -1 })
    expect(slide(0.05, 0.4, -1, 1, 0.1)).toEqual({ x: expect.closeTo(0.05, 5), dir: 1 })
    expect(slide(0.2, 0.4, 1, 1, 0.1)).toEqual({ x: expect.closeTo(0.3, 5), dir: 1 })
  })
})
