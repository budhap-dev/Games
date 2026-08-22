export type Lights = boolean[]

export function press(l: Lights, n: number, i: number): Lights {
  const out = l.slice()
  const r = Math.floor(i / n), c = i % n
  const flip = (rr: number, cc: number) => { if (rr >= 0 && cc >= 0 && rr < n && cc < n) out[rr * n + cc] = !out[rr * n + cc] }
  flip(r, c); flip(r - 1, c); flip(r + 1, c); flip(r, c - 1); flip(r, c + 1)
  return out
}

/** Scramble from the solved state with `k` distinct random presses → always solvable. */
export function scramble(n: number, k: number, rnd: () => number = Math.random): Lights {
  let l: Lights = Array(n * n).fill(false)
  const cells = Array.from({ length: n * n }, (_, i) => i)
  for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]] }
  for (const i of cells.slice(0, k)) l = press(l, n, i)
  return l.some(Boolean) ? l : scramble(n, k + 1, rnd)
}
export const isOff = (l: Lights) => l.every((v) => !v)
