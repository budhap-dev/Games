import type { Dir } from '@/shared/useInput'

/** walls bitmask per cell: 1=up 2=right 4=down 8=left */
export const W: Record<Dir, number> = { up: 1, right: 2, down: 4, left: 8 }
const OPP: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }
const D: Record<Dir, [number, number]> = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] }

export interface Maze { size: number; cells: number[] }

/** Recursive-backtracker maze on a size×size grid. */
export function generateMaze(size: number, rnd: () => number = Math.random): Maze {
  const cells = Array(size * size).fill(15)
  const seen = Array(size * size).fill(false)
  const stack: [number, number][] = [[0, 0]]
  seen[0] = true
  while (stack.length) {
    const [x, y] = stack[stack.length - 1]
    const opts = (Object.keys(D) as Dir[]).filter((d) => {
      const nx = x + D[d][0], ny = y + D[d][1]
      return nx >= 0 && ny >= 0 && nx < size && ny < size && !seen[ny * size + nx]
    })
    if (!opts.length) { stack.pop(); continue }
    const d = opts[Math.floor(rnd() * opts.length)]
    const nx = x + D[d][0], ny = y + D[d][1]
    cells[y * size + x] &= ~W[d]
    cells[ny * size + nx] &= ~W[OPP[d]]
    seen[ny * size + nx] = true
    stack.push([nx, ny])
  }
  return { size, cells }
}

export function canMove(m: Maze, x: number, y: number, d: Dir) {
  return (m.cells[y * m.size + x] & W[d]) === 0
}
export const move = (x: number, y: number, d: Dir): [number, number] => [x + D[d][0], y + D[d][1]]
