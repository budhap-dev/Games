import { describe, it, expect } from 'vitest'
import { createBricks, stepBall } from './logic'

const paddle = { x: 0.4, w: 0.2, h: 0.03, y: 0.92 }

describe('brick breaker', () => {
  it('lays out rows×cols bricks inside the unit square', () => {
    const b = createBricks(4, 7)
    expect(b.length).toBe(28)
    for (const br of b) { expect(br.x).toBeGreaterThanOrEqual(0); expect(br.x + br.w).toBeLessThanOrEqual(1.0001) }
  })
  it('bounces off the left wall', () => {
    const ball = { x: 0.01, y: 0.5, vx: -0.02, vy: 0, r: 0.015 }
    const r = stepBall(ball, paddle, [])
    expect(r.bounced).toBe(true); expect(ball.vx).toBeGreaterThan(0)
  })
  it('breaks a brick and reflects', () => {
    const bricks = createBricks(1, 1)
    const br = bricks[0]
    const ball = { x: br.x + br.w / 2, y: br.y + br.h + 0.01, vx: 0, vy: -0.02, r: 0.015 }
    const r = stepBall(ball, paddle, bricks)
    expect(r.broke).toBe(1); expect(br.alive).toBe(false); expect(ball.vy).toBeGreaterThan(0)
  })
  it('reports a lost ball below the floor', () => {
    const ball = { x: 0.1, y: 1.1, vx: 0, vy: 0.02, r: 0.015 }
    expect(stepBall(ball, paddle, []).lost).toBe(true)
  })
})
