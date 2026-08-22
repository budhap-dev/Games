import { describe, it, expect } from 'vitest'
import { spawn, stepItems } from './logic'

describe('fruit catch', () => {
  it('catches an item that falls into the basket and misses others', () => {
    const items = [
      { x: 0.5, y: 0.85, kind: 'fruit' as const, emoji: '🍎', vy: 0.2 },
      { x: 0.1, y: 0.85, kind: 'fruit' as const, emoji: '🍌', vy: 0.2 },
      { x: 0.9, y: 1.02, kind: 'boot' as const, emoji: '🥾', vy: 0.4 },
    ]
    const r = stepItems(items, 0.5, 0.18, 0.1)
    expect(r.caught.map((i) => i.emoji)).toEqual(['🍎'])
    expect(r.missed.map((i) => i.emoji)).toEqual(['🥾'])
    expect(r.remaining.length).toBe(1)
  })
  it('spawns boots at roughly the requested rate', () => {
    let boots = 0
    for (let i = 0; i < 1000; i++) if (spawn(0.2, 0.3).kind === 'boot') boots++
    expect(boots).toBeGreaterThan(120); expect(boots).toBeLessThan(280)
  })
})
