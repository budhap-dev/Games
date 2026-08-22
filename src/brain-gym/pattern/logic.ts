import { pick, shuffle } from '@/shared/random'
import type { Difficulty } from '@/shared/store'

export interface Round { seq: string[]; answer: string; options: string[] }

const SHAPES = ['🔺', '🟦', '⚫', '⭐', '❤️', '🔶', '🟢', '💜']
const ANIMALS = ['🐶', '🐱', '🐸', '🦊', '🐼', '🐰']
const FRUIT = ['🍎', '🍌', '🍇', '🍓', '🍊']
const SETS = [SHAPES, ANIMALS, FRUIT]

type Kind = 'abab' | 'abc' | 'aabb' | 'grow' | 'numbers' | 'abba' | 'abcb'
const KINDS: Record<Difficulty, Kind[]> = {
  easy: ['abab', 'abc', 'abab', 'aabb'],
  normal: ['abab', 'abc', 'aabb', 'grow', 'numbers', 'abba'],
  hard: ['abc', 'aabb', 'grow', 'numbers', 'abba', 'abcb'],
}

function repeatPattern(unit: string[], len: number) {
  return Array.from({ length: len + 1 }, (_, i) => unit[i % unit.length])
}

export function makeRound(d: Difficulty, rnd: () => number = Math.random): Round {
  const kind = pick(KINDS[d], rnd)
  const set = shuffle(pick(SETS, rnd), rnd)
  const [a, b, c] = set
  const nOpts = d === 'easy' ? 3 : 4
  let full: string[]
  let distractors: string[]
  switch (kind) {
    case 'abab': full = repeatPattern([a, b], 5); distractors = set.slice(2); break
    case 'abc': full = repeatPattern([a, b, c], 6); distractors = set.slice(3); break
    case 'aabb': full = repeatPattern([a, a, b, b], 6); distractors = set.slice(2); break
    case 'abba': full = repeatPattern([a, b, b, a], 6); distractors = set.slice(2); break
    case 'abcb': full = repeatPattern([a, b, c, b], 7); distractors = set.slice(3); break
    case 'grow': {
      const k = 1 + Math.floor(rnd() * 2)
      full = [1, 2, 3, 4, 5].map((n) => a.repeat(n * k))
      distractors = [a.repeat(5 * k - 1), a.repeat(5 * k + 1), b.repeat(5 * k)]
      break
    }
    case 'numbers': {
      const step = d === 'hard' ? pick([2, 3, 5], rnd) : pick([1, 2], rnd)
      const start = 1 + Math.floor(rnd() * 5)
      full = [0, 1, 2, 3, 4].map((i) => String(start + i * step))
      const ans = start + 4 * step
      distractors = [String(ans + 1), String(ans - 1), String(ans + step), String(ans - step - 1)].filter((x) => x !== String(ans))
      break
    }
  }
  const answer = full[full.length - 1]
  const seq = full.slice(0, -1)
  const opts = [answer, ...shuffle([...new Set(distractors.filter((x) => x !== answer))], rnd).slice(0, nOpts - 1)]
  return { seq, answer, options: shuffle(opts, rnd) }
}
