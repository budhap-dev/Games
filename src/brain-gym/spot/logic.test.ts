import { describe, it, expect } from 'vitest'
import { generateScene, hitTest } from './logic'
import { seeded } from '@/shared/random'

describe('spot the difference', () => {
  it('creates exactly n visible differences', () => {
    for (const n of [3, 5, 7]) {
      const s = generateScene(n, seeded(n))
      expect(s.changes.length).toBe(n)
      const diffs = s.left.filter((l, i) => l.emoji !== s.right[i].emoji || l.size !== s.right[i].size)
      expect(diffs.length).toBe(n)
    }
  })
  it('hit-tests a tap near a changed item', () => {
    const s = generateScene(5, seeded(42))
    const it = s.left.find((i) => i.id === s.changes[0].id)!
    expect(hitTest(s, it.x + 2, it.y - 2)?.id).toBe(it.id)
    expect(hitTest(s, -50, -50)).toBeNull()
  })
})
