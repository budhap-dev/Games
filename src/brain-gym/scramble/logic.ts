import { shuffle } from '@/shared/random'
import type { Difficulty } from '@/shared/store'

export interface Word { word: string; emoji: string }

/** Picture-backed words so non-readers get a clue, and anagrams (tab/bat) are never ambiguous. */
export const WORDS: Record<Difficulty, Word[]> = {
  easy: [
    ['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['bus', '🚌'], ['pig', '🐷'], ['cow', '🐮'], ['hat', '🎩'], ['egg', '🥚'],
    ['bee', '🐝'], ['fox', '🦊'], ['owl', '🦉'], ['ant', '🐜'], ['car', '🚗'], ['bed', '🛏️'], ['cup', '☕'], ['key', '🔑'],
    ['box', '📦'], ['bat', '🦇'], ['ice', '🧊'], ['pie', '🥧'], ['web', '🕸️'], ['map', '🗺️'],
  ].map(([word, emoji]) => ({ word, emoji })),
  normal: [
    ['frog', '🐸'], ['fish', '🐟'], ['duck', '🦆'], ['bear', '🐻'], ['lion', '🦁'], ['moon', '🌙'], ['star', '⭐'], ['cake', '🎂'],
    ['tree', '🌳'], ['boat', '⛵'], ['kite', '🪁'], ['ship', '🚢'], ['rain', '🌧️'], ['milk', '🥛'], ['corn', '🌽'], ['book', '📖'],
    ['ball', '⚽'], ['drum', '🥁'], ['bell', '🔔'], ['sock', '🧦'], ['door', '🚪'], ['crab', '🦀'], ['snow', '❄️'], ['leaf', '🍃'],
    ['rose', '🌹'], ['gift', '🎁'],
  ].map(([word, emoji]) => ({ word, emoji })),
  hard: [
    ['apple', '🍎'], ['tiger', '🐯'], ['horse', '🐴'], ['snake', '🐍'], ['zebra', '🦓'], ['whale', '🐳'], ['robot', '🤖'], ['pizza', '🍕'],
    ['train', '🚆'], ['house', '🏠'], ['bread', '🍞'], ['grape', '🍇'], ['lemon', '🍋'], ['mouse', '🐭'], ['sheep', '🐑'], ['spoon', '🥄'],
    ['chair', '🪑'], ['cloud', '☁️'], ['rocket', '🚀'], ['monkey', '🐵'], ['rabbit', '🐰'], ['banana', '🍌'], ['turtle', '🐢'],
    ['carrot', '🥕'], ['castle', '🏰'], ['pencil', '✏️'], ['guitar', '🎸'], ['flower', '🌸'], ['dragon', '🐉'], ['parrot', '🦜'], ['cookie', '🍪'],
  ].map(([word, emoji]) => ({ word, emoji })),
}

/** Shuffled letters of `word`, never in the original order (unless every letter is the same). */
export function scramble(word: string, rnd: () => number = Math.random): string[] {
  const letters = word.split('')
  if (new Set(letters).size < 2) return letters
  for (;;) {
    const s = shuffle(letters, rnd)
    if (s.join('') !== word) return s
  }
}

/** `n` different words for one game. */
export const pickWords = (d: Difficulty, n: number, rnd: () => number = Math.random): Word[] => shuffle(WORDS[d], rnd).slice(0, n)
