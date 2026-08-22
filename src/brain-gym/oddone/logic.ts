import { pick, shuffle } from '@/shared/random'
import type { Difficulty } from '@/shared/store'

export interface OddRound { items: string[]; odd: string; hint: string }

interface Cat { name: string; items: string[]; group: string }
const CATS: Cat[] = [
  { name: 'animals', group: 'living', items: ['🐶', '🐱', '🐰', '🐭', '🐹', '🦊', '🐻', '🐼'] },
  { name: 'sea creatures', group: 'living', items: ['🐙', '🐟', '🐬', '🦀', '🐳', '🦑', '🐠', '🦐'] },
  { name: 'birds', group: 'living', items: ['🐦', '🦆', '🦉', '🐧', '🦜', '🦩', '🐔', '🦢'] },
  { name: 'bugs', group: 'living', items: ['🐝', '🐞', '🦋', '🐛', '🐜', '🦗', '🪲', '🐌'] },
  { name: 'fruit', group: 'food', items: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍒', '🍑'] },
  { name: 'vegetables', group: 'food', items: ['🥕', '🥦', '🌽', '🍅', '🥒', '🫑', '🍆', '🥔'] },
  { name: 'sweets', group: 'food', items: ['🍩', '🍪', '🍰', '🧁', '🍭', '🍫', '🍬', '🍦'] },
  { name: 'vehicles', group: 'things', items: ['🚗', '🚌', '🚓', '🚑', '🚜', '🚚', '🏍️', '🚲'] },
  { name: 'clothes', group: 'things', items: ['👕', '👗', '🧢', '👟', '🧦', '🧤', '🧣', '👖'] },
  { name: 'sports', group: 'things', items: ['⚽', '🏀', '🎾', '🏈', '⚾', '🏐', '🏓', '🥎'] },
  { name: 'weather', group: 'things', items: ['☀️', '🌧️', '⛈️', '🌈', '❄️', '🌤️', '🌪️', '🌫️'] },
  { name: 'shapes', group: 'things', items: ['🔺', '🟦', '⚫', '🟢', '🔶', '🟣', '⬛', '🔷'] },
]
const COUNT: Record<Difficulty, number> = { easy: 4, normal: 6, hard: 8 }

/** Easy/normal: odd item from a different group. Hard: odd item from a *related* category (same group). */
export function makeOddRound(d: Difficulty, rnd: () => number = Math.random): OddRound {
  const main = pick(CATS, rnd)
  const pool = d === 'hard' ? CATS.filter((c) => c.group === main.group && c !== main) : CATS.filter((c) => c.group !== main.group)
  const other = pick(pool.length ? pool : CATS.filter((c) => c !== main), rnd)
  const n = COUNT[d]
  const items = shuffle(main.items, rnd).slice(0, n - 1)
  const odd = pick(other.items, rnd)
  return { items: shuffle([...items, odd], rnd), odd, hint: `${main.name} vs. ${other.name}` }
}
