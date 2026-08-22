/** Tiles 1..n*n-1 and 0 for the blank. Index = position. */
export type Tiles = number[]

export const solved = (n: number): Tiles => [...Array.from({ length: n * n - 1 }, (_, i) => i + 1), 0]
export const isSolved = (t: Tiles) => t.every((v, i) => v === (i === t.length - 1 ? 0 : i + 1))

export function neighborsOfBlank(t: Tiles, n: number): number[] {
  const b = t.indexOf(0), r = Math.floor(b / n), c = b % n
  const out: number[] = []
  if (r > 0) out.push(b - n); if (r < n - 1) out.push(b + n)
  if (c > 0) out.push(b - 1); if (c < n - 1) out.push(b + 1)
  return out
}

/** Slide tile at index i into the blank if adjacent; returns new tiles or null. */
export function move(t: Tiles, i: number, n: number): Tiles | null {
  if (!neighborsOfBlank(t, n).includes(i)) return null
  const b = t.indexOf(0)
  const nt = t.slice(); nt[b] = nt[i]; nt[i] = 0
  return nt
}

/** Shuffle by random legal moves so the puzzle is always solvable. */
export function shuffle(n: number, moves: number, rnd: () => number = Math.random): Tiles {
  let t = solved(n), last = -1
  for (let k = 0; k < moves; k++) {
    const opts = neighborsOfBlank(t, n).filter((i) => i !== last)
    const i = opts[Math.floor(rnd() * opts.length)]
    last = t.indexOf(0)
    t = move(t, i, n)!
  }
  return isSolved(t) ? shuffle(n, moves + 1, rnd) : t
}
