import type { Dir } from '@/shared/useInput'

export interface Pt { x: number; y: number }
export interface SnakeState {
  size: number
  snake: Pt[] // head first
  dir: Dir
  fruit: Pt
  score: number
  alive: boolean
  grew: boolean
}

const DELTA: Record<Dir, Pt> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }
export const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' }

export function placeFruit(size: number, snake: Pt[], rnd = Math.random): Pt {
  const taken = new Set(snake.map((p) => p.x * 1000 + p.y))
  const free: Pt[] = []
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!taken.has(x * 1000 + y)) free.push({ x, y })
  return free[Math.floor(rnd() * free.length)] ?? { x: -1, y: -1 }
}

export function createSnake(size: number, rnd = Math.random): SnakeState {
  const mid = Math.floor(size / 2)
  const snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }]
  return { size, snake, dir: 'right', fruit: placeFruit(size, snake, rnd), score: 0, alive: true, grew: false }
}

/** Advance one tick. `wrap` lets the snake pass through walls (Easy mode). */
export function step(s: SnakeState, dir: Dir, wrap: boolean, rnd = Math.random): SnakeState {
  if (!s.alive) return s
  const d = dir === OPPOSITE[s.dir] ? s.dir : dir
  const head = s.snake[0]
  let nx = head.x + DELTA[d].x, ny = head.y + DELTA[d].y
  if (wrap) { nx = (nx + s.size) % s.size; ny = (ny + s.size) % s.size }
  else if (nx < 0 || ny < 0 || nx >= s.size || ny >= s.size) return { ...s, dir: d, alive: false }
  const eats = nx === s.fruit.x && ny === s.fruit.y
  const body = eats ? s.snake : s.snake.slice(0, -1)
  if (body.some((p) => p.x === nx && p.y === ny)) return { ...s, dir: d, alive: false }
  const snake = [{ x: nx, y: ny }, ...body]
  return {
    ...s, dir: d, snake, grew: eats,
    score: eats ? s.score + 1 : s.score,
    fruit: eats ? placeFruit(s.size, snake, rnd) : s.fruit,
  }
}
