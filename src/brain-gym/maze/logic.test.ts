import { describe, it, expect } from 'vitest'
import { canMove, generateMaze, move } from './logic'
import type { Dir } from '@/shared/useInput'

describe('maze', () => {
  it('is fully connected: every cell reachable from the start', () => {
    const n = 10
    const m = generateMaze(n)
    const seen = new Set<number>([0])
    const q: [number, number][] = [[0, 0]]
    while (q.length) {
      const [x, y] = q.shift()!
      for (const d of ['up', 'right', 'down', 'left'] as Dir[]) {
        if (!canMove(m, x, y, d)) continue
        const [nx, ny] = move(x, y, d)
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue
        if (!seen.has(ny * n + nx)) { seen.add(ny * n + nx); q.push([nx, ny]) }
      }
    }
    expect(seen.size).toBe(n * n)
  })
  it('keeps the outer border walled', () => {
    const n = 6
    const m = generateMaze(n)
    for (let i = 0; i < n; i++) {
      expect(canMove(m, i, 0, 'up')).toBe(false)
      expect(canMove(m, i, n - 1, 'down')).toBe(false)
      expect(canMove(m, 0, i, 'left')).toBe(false)
      expect(canMove(m, n - 1, i, 'right')).toBe(false)
    }
  })
})
