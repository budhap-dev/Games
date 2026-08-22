import { useEffect, useRef, useState } from 'react'
import type { GameProps } from '../types'
import { createBricks, stepBall } from './logic'
import type { Ball, Brick, Paddle } from './logic'
import { useGameLoop } from '@/shared/useGameLoop'
import { useCanvasSize, rrect } from '@/shared/useCanvas'
import { sfx } from '@/shared/audio'

const COLORS = ['#ff5fa2', '#ff7a1a', '#ffc93c', '#3fb55b', '#2d9cdb', '#7b4fd6']
const CONFIG = {
  easy: { rows: 3, cols: 6, speed: 0.010, paddle: 0.28, lives: 5 },
  normal: { rows: 4, cols: 7, speed: 0.013, paddle: 0.22, lives: 3 },
  hard: { rows: 5, cols: 8, speed: 0.016, paddle: 0.18, lives: 3 },
}
const STEP = 16

export default function BricksGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const canvas = useRef<HTMLCanvasElement>(null)
  const size = useCanvasSize(canvas)
  const bricks = useRef<Brick[]>(createBricks(cfg.rows, cfg.cols))
  const paddle = useRef<Paddle>({ x: 0.5 - cfg.paddle / 2, w: cfg.paddle, h: 0.03, y: 0.92 })
  const ball = useRef<Ball>({ x: 0.5, y: 0.88, vx: 0, vy: 0, r: 0.018 })
  const launched = useRef(false)
  const keys = useRef({ left: false, right: false })
  const [lives, setLives] = useState(cfg.lives)
  const score = useRef(0)
  const ended = useRef(false)

  const launch = () => {
    if (launched.current || paused || ended.current) return
    launched.current = true
    const a = (Math.random() - 0.5) * 0.8
    ball.current.vx = Math.sin(a) * cfg.speed; ball.current.vy = -Math.cos(a) * cfg.speed
    sfx.tap()
  }

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const move = (e: PointerEvent) => {
      const b = c.getBoundingClientRect()
      const x = (e.clientX - b.left) / b.width
      paddle.current.x = Math.max(0, Math.min(1 - paddle.current.w, x - paddle.current.w / 2))
    }
    const down = (e: PointerEvent) => { move(e); launch(); c.setPointerCapture(e.pointerId) }
    const key = (e: KeyboardEvent, on: boolean) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') { keys.current.left = on; e.preventDefault() }
      if (e.key === 'ArrowRight' || e.key === 'd') { keys.current.right = on; e.preventDefault() }
      if (on && (e.key === ' ' || e.key === 'ArrowUp')) { launch(); e.preventDefault() }
    }
    const kd = (e: KeyboardEvent) => key(e, true), ku = (e: KeyboardEvent) => key(e, false)
    c.addEventListener('pointermove', move); c.addEventListener('pointerdown', down)
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku)
    return () => { c.removeEventListener('pointermove', move); c.removeEventListener('pointerdown', down); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  const update = () => {
    if (ended.current) return
    const p = paddle.current
    if (keys.current.left) p.x = Math.max(0, p.x - 0.02)
    if (keys.current.right) p.x = Math.min(1 - p.w, p.x + 0.02)
    const b = ball.current
    if (!launched.current) { b.x = p.x + p.w / 2; b.y = p.y - b.r - 0.005; return }
    const r = stepBall(b, p, bricks.current)
    if (r.broke) {
      sfx.pop()
      score.current += r.broke; onScore(score.current)
      if (bricks.current.every((x) => !x.alive)) {
        ended.current = true; sfx.win()
        const total = bricks.current.length
        setTimeout(() => onEnd({ score: total, won: true, message: 'You smashed every brick!', emoji: '🧱' }), 500)
      }
    } else if (r.bounced) sfx.flip()
    if (r.lost) {
      sfx.bad()
      launched.current = false
      b.vx = 0; b.vy = 0
      setLives((l) => {
        const n = l - 1
        if (n <= 0) {
          ended.current = true
          const broken = bricks.current.filter((x) => !x.alive).length
          setTimeout(() => onEnd({ score: broken, won: false, message: `Good try! ${broken} bricks smashed`, emoji: '🏓' }), 500)
        }
        return n
      })
    }
  }

  const render = () => {
    const c = canvas.current
    if (!c || !size) return
    const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#1d2140'; ctx.fillRect(0, 0, size, size)
    for (const br of bricks.current) {
      if (!br.alive) continue
      ctx.fillStyle = COLORS[br.col]
      rrect(ctx, br.x * size, br.y * size, br.w * size, br.h * size, 6)
    }
    const p = paddle.current
    ctx.fillStyle = '#ffc93c'; rrect(ctx, p.x * size, p.y * size, p.w * size, p.h * size, 8)
    const b = ball.current
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x * size, b.y * size, b.r * size, 0, Math.PI * 2); ctx.fill()
    ctx.font = `${size * 0.05}px serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    ctx.fillText('❤️'.repeat(Math.max(0, lives)), 10, 8)
    if (!launched.current && !ended.current) {
      ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = `bold ${size * 0.05}px Fredoka, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('Tap to launch!', size / 2, size * 0.6)
    }
  }

  useGameLoop(!paused, STEP, update, render)

  return <div className="stage"><canvas ref={canvas} aria-label="Brick Breaker — slide to move the paddle, tap to launch" /></div>
}
