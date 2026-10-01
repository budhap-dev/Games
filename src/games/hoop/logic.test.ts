import { describe, it, expect } from 'vitest'
import { aimFromDrag, bounceBoard, path, spawnHoop, stepBall, throughHoop } from './logic'
import { seeded } from '@/shared/random'

describe('hoop toss', () => {
  it('gravity bends the path into an arc', () => {
    const pts = path({ x: 0, y: 0.8, vx: 1, vy: -1.5 }, 1.6, 0, 0.05, 40)
    const top = Math.min(...pts.map((p) => p.y))
    expect(top).toBeLessThan(0.8); expect(pts[pts.length - 1].y).toBeGreaterThan(top)
    expect(pts[pts.length - 1].x).toBeCloseTo(2, 5) // no wind → steady sideways speed
  })
  it('wind pushes sideways', () => {
    expect(stepBall({ x: 0, y: 0, vx: 0, vy: 0 }, 0, 1, 0.1).vx).toBeCloseTo(0.1)
  })
  it('caps launch speed', () => {
    const v = aimFromDrag(1, -1, 5, 2)
    expect(Math.hypot(v.vx, v.vy)).toBeCloseTo(2)
  })
  it('scores only when falling through the middle of the rim', () => {
    const h = { x: 0.6, y: 0.5, w: 0.15 }
    expect(throughHoop({ x: 0.67, y: 0.48, vx: 0, vy: 1 }, { x: 0.68, y: 0.52, vx: 0, vy: 1 }, h, 0.03)).toBe(true)
    expect(throughHoop({ x: 0.67, y: 0.52, vx: 0, vy: -1 }, { x: 0.68, y: 0.48, vx: 0, vy: -1 }, h, 0.03)).toBe(false) // going up
    expect(throughHoop({ x: 0.58, y: 0.48, vx: 0, vy: 1 }, { x: 0.6, y: 0.52, vx: 0, vy: 1 }, h, 0.03)).toBe(false) // hits the rim edge
  })
  it('bounces back off the backboard', () => {
    const h = { x: 0.6, y: 0.5, w: 0.15 }
    const b = bounceBoard({ x: 0.72, y: 0.45, vx: 1, vy: 0 }, { x: 0.75, y: 0.45, vx: 1, vy: 0 }, h, 0.03)
    expect(b.vx).toBeLessThan(0)
  })
  it('hoops stay on the right side of the court', () => {
    const rnd = seeded(4)
    for (let k = 0; k < 50; k++) { const h = spawnHoop(0.15, rnd); expect(h.x).toBeGreaterThanOrEqual(0.5); expect(h.x + h.w).toBeLessThanOrEqual(0.9) }
  })
})
