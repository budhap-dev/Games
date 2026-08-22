import { describe, it, expect } from 'vitest'
import { createSnake, step } from './logic'

const rnd = () => 0 // deterministic fruit placement

describe('snake', () => {
  it('moves right by default and keeps length', () => {
    const s = createSnake(9, rnd)
    const n = step(s, 'right', false, rnd)
    expect(n.snake[0]).toEqual({ x: 5, y: 4 })
    expect(n.snake.length).toBe(3)
  })
  it('ignores reversing into itself', () => {
    const s = createSnake(9, rnd)
    const n = step(s, 'left', false, rnd)
    expect(n.dir).toBe('right')
    expect(n.alive).toBe(true)
  })
  it('dies on the wall when wrap is off, wraps when on', () => {
    let s = createSnake(5, rnd)
    for (let i = 0; i < 3; i++) s = step(s, 'right', false, rnd)
    expect(s.alive).toBe(false)
    let w = createSnake(5, rnd)
    for (let i = 0; i < 3; i++) w = step(w, 'right', true, rnd)
    expect(w.alive).toBe(true)
    expect(w.snake[0].x).toBe(0)
  })
  it('grows and scores when eating fruit', () => {
    const s = { ...createSnake(9, rnd), fruit: { x: 5, y: 4 } }
    const n = step(s, 'right', false, rnd)
    expect(n.score).toBe(1)
    expect(n.snake.length).toBe(4)
    expect(n.fruit).not.toEqual({ x: 5, y: 4 })
  })
})
