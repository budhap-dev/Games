import { describe, it, expect } from 'vitest'
import { BEE_X, collides, flap, stepBee } from './logic'

describe('flappy bee', () => {
  it('falls under gravity and rises on flap', () => {
    const b = { y: 0.5, vy: 0 }
    stepBee(b, 2, 0.1); expect(b.y).toBeGreaterThan(0.5)
    flap(b, 0.8); stepBee(b, 2, 0.1); expect(b.vy).toBeLessThan(0)
  })
  it('passes through a gap but hits the flower outside it', () => {
    const pipes = [{ x: BEE_X - 0.05, gapY: 0.5, passed: false }]
    expect(collides({ y: 0.5, vy: 0 }, pipes, 0.3)).toBe(false)
    expect(collides({ y: 0.2, vy: 0 }, pipes, 0.3)).toBe(true)
    expect(collides({ y: 0.97, vy: 0 }, [], 0.3)).toBe(true)
  })
})
