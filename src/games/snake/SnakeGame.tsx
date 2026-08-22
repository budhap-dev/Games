import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameProps } from '../types'
import { createSnake, step, OPPOSITE } from './logic'
import type { SnakeState } from './logic'
import { useGameLoop } from '@/shared/useGameLoop'
import { useDirectionInput } from '@/shared/useInput'
import type { Dir } from '@/shared/useInput'
import { DPad } from '@/shared/DPad'
import { useCanvasSize, rrect } from '@/shared/useCanvas'
import { sfx } from '@/shared/audio'

const CONFIG = {
  easy: { size: 13, stepMs: 190, wrap: true },
  normal: { size: 15, stepMs: 140, wrap: false },
  hard: { size: 17, stepMs: 100, wrap: false },
}
const FRUITS = ['🍎', '🍓', '🍇', '🍊', '🍉', '🍒']

export default function SnakeGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const canvas = useRef<HTMLCanvasElement>(null)
  const size = useCanvasSize(canvas)
  const state = useRef<SnakeState>(createSnake(cfg.size))
  const queue = useRef<Dir[]>([])
  const [fruitIdx, setFruitIdx] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const ended = useRef(false)

  // 3-2-1 countdown before the snake moves
  useEffect(() => {
    if (paused || countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 700)
    return () => clearTimeout(t)
  }, [countdown, paused])

  const pushDir = useCallback((d: Dir) => {
    const q = queue.current
    const last = q[q.length - 1] ?? state.current.dir
    if (d === last || d === OPPOSITE[last]) return
    if (q.length < 3) q.push(d)
  }, [])
  useDirectionInput(pushDir, !paused)

  const update = () => {
    if (ended.current) return
    const s = state.current
    const d = queue.current.shift() ?? s.dir
    const next = step(s, d, cfg.wrap)
    state.current = next
    if (next.grew) { sfx.pop(); onScore(next.score); setFruitIdx((i) => (i + 1) % FRUITS.length) }
    if (!next.alive) {
      ended.current = true
      sfx.bad()
      const n = next.score
      onEnd({ score: n, won: n >= 10, message: n === 0 ? 'Oops! Try again?' : n < 10 ? `Ooh, so close! ${n} apples!` : `Wow! ${n} apples!`, emoji: n >= 10 ? '🎉' : '🐍' })
    }
  }

  const render = () => {
    const c = canvas.current
    if (!c || !size) return
    const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const s = state.current
    const cell = size / s.size
    // grass checkerboard
    for (let y = 0; y < s.size; y++) for (let x = 0; x < s.size; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#d6f2dc' : '#c9ecd1'
      ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5)
    }
    // fruit
    ctx.font = `${cell * 0.8}px serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(FRUITS[fruitIdx], (s.fruit.x + 0.5) * cell, (s.fruit.y + 0.55) * cell)
    // snake
    s.snake.forEach((p, i) => {
      const t = i / Math.max(1, s.snake.length - 1)
      ctx.fillStyle = i === 0 ? '#2f9e4a' : `hsl(${130 + t * 30}, 60%, ${45 + t * 15}%)`
      const pad = cell * 0.06
      rrect(ctx, p.x * cell + pad, p.y * cell + pad, cell - pad * 2, cell - pad * 2, cell * 0.3)
    })
    // eyes
    const h = s.snake[0]
    const ex = h.x * cell + cell / 2, ey = h.y * cell + cell / 2
    const off = cell * 0.2
    const dx = s.dir === 'left' ? -1 : s.dir === 'right' ? 1 : 0
    const dy = s.dir === 'up' ? -1 : s.dir === 'down' ? 1 : 0
    ctx.fillStyle = '#fff'
    for (const sgn of [-1, 1]) {
      const px = ex + dx * off * 0.8 + (dy ? sgn * off : 0)
      const py = ey + dy * off * 0.8 + (dx ? sgn * off : 0)
      ctx.beginPath(); ctx.arc(px, py, cell * 0.13, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#1d2140'; ctx.beginPath(); ctx.arc(px + dx * 2, py + dy * 2, cell * 0.06, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'
    }
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(29,33,64,.35)'; ctx.fillRect(0, 0, size, size)
      ctx.fillStyle = '#fff'; ctx.font = `bold ${size * 0.3}px Fredoka, sans-serif`
      ctx.fillText(String(countdown), size / 2, size / 2)
    }
  }

  useGameLoop(!paused && countdown <= 0 && !ended.current, cfg.stepMs, update, render)

  return (
    <>
      <div className="stage"><canvas ref={canvas} aria-label="Snake game board" /></div>
      <DPad onDir={pushDir} />
    </>
  )
}
