export type Pegs = number[][] // each peg: discs bottom→top, disc = size (1 smallest)
export const start = (n: number): Pegs => [Array.from({ length: n }, (_, i) => n - i), [], []]
export function canMove(p: Pegs, from: number, to: number) {
  const a = p[from], b = p[to]
  if (!a.length || from === to) return false
  return !b.length || b[b.length - 1] > a[a.length - 1]
}
export function move(p: Pegs, from: number, to: number): Pegs {
  const n = p.map((x) => x.slice()); n[to].push(n[from].pop()!); return n
}
export const solved = (p: Pegs, n: number) => p[2].length === n
export const optimal = (n: number) => 2 ** n - 1
