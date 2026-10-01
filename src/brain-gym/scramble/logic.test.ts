import { describe, it, expect } from 'vitest'
import { WORDS, pickWords, scramble } from './logic'
import { seeded } from '@/shared/random'

describe('word scramble', () => {
  it('scrambles to the same letters in a different order', () => {
    const rnd = seeded(3)
    for (const { word } of [...WORDS.easy, ...WORDS.normal, ...WORDS.hard]) {
      const s = scramble(word, rnd)
      expect(s.join('')).not.toBe(word)
      expect([...s].sort().join('')).toBe(word.split('').sort().join(''))
    }
  })
  it('word lengths grow with difficulty and words are unique', () => {
    expect(WORDS.easy.every((w) => w.word.length === 3)).toBe(true)
    expect(WORDS.normal.every((w) => w.word.length === 4)).toBe(true)
    expect(WORDS.hard.every((w) => w.word.length >= 5)).toBe(true)
    const all = [...WORDS.easy, ...WORDS.normal, ...WORDS.hard].map((w) => w.word)
    expect(new Set(all).size).toBe(all.length)
  })
  it('picks distinct words for a game', () => {
    const ws = pickWords('normal', 8, seeded(1))
    expect(ws).toHaveLength(8)
    expect(new Set(ws.map((w) => w.word)).size).toBe(8)
  })
})
