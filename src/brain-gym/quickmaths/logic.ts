import { pick, randInt, shuffle } from '@/shared/random'
import type { Difficulty } from '@/shared/store'

export interface Question { text: string; answer: number; options: number[] }

export function makeQuestion(d: Difficulty, rnd: () => number = Math.random): Question {
  let a: number, b: number, op: '+' | '−' | '×'
  if (d === 'easy') {
    op = pick(['+', '−'], rnd)
    if (op === '+') { a = 1 + randInt(9, rnd); b = 1 + randInt(10 - a, rnd) } else { a = 2 + randInt(9, rnd); b = 1 + randInt(a, rnd) }
  } else if (d === 'normal') {
    op = pick(['+', '−', '×'], rnd)
    if (op === '+') { a = 1 + randInt(19, rnd); b = 1 + randInt(20 - a, rnd) }
    else if (op === '−') { a = 2 + randInt(19, rnd); b = 1 + randInt(a, rnd) }
    else { a = pick([2, 5, 10], rnd); b = 1 + randInt(10, rnd) }
  } else {
    op = pick(['+', '−', '×', '×'], rnd)
    if (op === '+') { a = 10 + randInt(80, rnd); b = 1 + randInt(100 - a, rnd) }
    else if (op === '−') { a = 20 + randInt(81, rnd); b = 1 + randInt(a, rnd) }
    else { a = 2 + randInt(9, rnd); b = 2 + randInt(9, rnd) }
  }
  const answer = op === '+' ? a + b : op === '−' ? a - b : a * b
  const ds = new Set<number>()
  const step = op === '×' ? Math.max(a, b) : 1
  const cands = [answer + 1, answer - 1, answer + 2, answer - 2, answer + step, answer - step, answer + 10, answer + step * 2]
  for (const c of shuffle(cands, rnd)) { if (c >= 0 && c !== answer) ds.add(c); if (ds.size === 3) break }
  let k = 3
  while (ds.size < 3) { if (answer + k !== answer) ds.add(answer + k); k++ }
  return { text: `${a} ${op} ${b} = ?`, answer, options: shuffle([answer, ...ds], rnd) }
}
