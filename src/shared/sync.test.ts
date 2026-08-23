import { describe, it, expect } from 'vitest'
import { mergeProgress } from './sync'
import type { Progress } from './sync'

const P = (o: Partial<Progress>): Progress => ({ best: {}, plays: {}, wins: {}, playSeconds: {}, puzzlesByDay: {}, stickers: [], favs: [], difficulty: {}, ...o })

describe('progress merge', () => {
  it('returns local when there is no cloud copy', () => { const l = P({ best: { snake: 3 } }); expect(mergeProgress(l, null)).toBe(l) })
  it('keeps the best of bests, sums counts, unions stickers and favs, prefers local settings', () => {
    const l = P({ best: { snake: 5, g2048: 100 }, plays: { snake: 2 }, stickers: ['a'], favs: ['snake'], difficulty: { snake: 'hard' } })
    const c = P({ best: { snake: 9, maze: 1 }, plays: { snake: 3, maze: 1 }, stickers: ['b'], favs: ['maze'], difficulty: { snake: 'easy', maze: 'normal' } })
    const m = mergeProgress(l, c)
    expect(m.best).toEqual({ snake: 9, g2048: 100, maze: 1 })
    expect(m.plays).toEqual({ snake: 5, maze: 1 })
    expect(m.stickers.sort()).toEqual(['a', 'b']); expect(m.favs.sort()).toEqual(['maze', 'snake'])
    expect(m.difficulty).toEqual({ snake: 'hard', maze: 'normal' })
  })
  it('does not double count when the cloud already includes this device', () => {
    const l = P({ plays: { snake: 2 } }); const c = P({ plays: { snake: 2 } })
    expect(mergeProgress(l, c, true).plays).toEqual({ snake: 2 })
  })
  it('keeps the table fact with more attempts', () => {
    const l = P({ tables: { stats: { '7x8': { seen: 3, correct: 3, avgMs: 1000 } }, tables: [7] } })
    const c = P({ tables: { stats: { '7x8': { seen: 5, correct: 2, avgMs: 3000 }, '2x2': { seen: 1, correct: 1, avgMs: 500 } }, tables: [2] } })
    const m = mergeProgress(l, c)
    expect(m.tables?.stats['7x8'].seen).toBe(5); expect(m.tables?.stats['2x2']).toBeDefined(); expect(m.tables?.tables).toEqual([7])
  })
})
