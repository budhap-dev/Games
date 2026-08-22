import { describe, it, expect } from 'vitest'
import { keyboardState, score } from './logic'
import { WORDS } from './words'

describe('word guess', () => {
  it('scores greens, yellows and greys with duplicates handled', () => {
    expect(score('crane', 'crane')).toEqual(['g', 'g', 'g', 'g', 'g'])
    expect(score('aabbb', 'abccc')).toEqual(['g', 'x', 'y', 'x', 'x']) // second a is grey (only one a in answer), b is misplaced
    expect(score('eerie', 'there')).toEqual(['y', 'x', 'y', 'x', 'g'])
  })
  it('keyboard keeps the best state per letter', () => {
    const k = keyboardState([{ guess: 'crane', marks: score('crane', 'train') }, { guess: 'trash', marks: score('trash', 'train') }])
    expect(k.t).toBe('g'); expect(k.c).toBe('x'); expect(k.a).toBe('g')
  })
  it('word list is clean', () => {
    expect(WORDS.length).toBeGreaterThan(400)
    for (const w of WORDS) expect(w).toMatch(/^[a-z]{5}$/)
    expect(new Set(WORDS).size).toBe(WORDS.length)
  })
})
