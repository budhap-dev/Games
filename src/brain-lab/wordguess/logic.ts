export type Mark = 'g' | 'y' | 'x'

/** Wordle-style scoring with correct duplicate handling. */
export function score(guess: string, answer: string): Mark[] {
  const g = guess.toLowerCase().split(''), a = answer.toLowerCase().split('')
  const out: Mark[] = Array(g.length).fill('x')
  const left: Record<string, number> = {}
  g.forEach((ch, i) => { if (ch === a[i]) out[i] = 'g'; else left[a[i]] = (left[a[i]] ?? 0) + 1 })
  g.forEach((ch, i) => { if (out[i] !== 'g' && left[ch]) { out[i] = 'y'; left[ch]-- } })
  return out
}

/** Best known state per letter for the keyboard: g beats y beats x. */
export function keyboardState(rows: { guess: string; marks: Mark[] }[]): Record<string, Mark> {
  const rank = { g: 3, y: 2, x: 1 }
  const out: Record<string, Mark> = {}
  for (const r of rows) r.guess.split('').forEach((ch, i) => { const m = r.marks[i]; if (!out[ch] || rank[m] > rank[out[ch]]) out[ch] = m })
  return out
}
