import { useEffect, useRef } from 'react'
import type { GameProps } from '../types'
import { drop, slide } from './logic'
import type { Block } from './logic'
import { useGameLoop } from '@/shared/useGameLoop'
import { useCanvasSize, rrect } from '@/shared/useCanvas'
import { sfx } from '@/shared/audio'

const CONFIG = {
  easy: { speed: 0.35, tol: 0.035 },
  normal: { speed: 0.5, tol: 0.022 },
  hard: { speed: 0.7, tol: 0.012 },
}
const STEP = 16
const H = 0.07 // block height (fraction of board)
const GROUND = 0.92
const colour = (level: number) => `hsl(${(level * 23) % 360} 75% 62%)`

interface Falling extends Block { level: number; y: number; vy: number }

export default function StackGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const canvas = useRef<HTMLCanvasElement>(null)
  const size = useCanvasSize(canvas)
  const stack = useRef<Block[]>([{ x: 0.2, w: 0.6 }])
  const moving = useRef({ x: 0, w: 0.6, dir: 1 as 1 | -1 })
  const falling = useRef<Falling[]>([])
  const cam = useRef(0)
  const flash = useRef(0) // "Perfect!" fade
  const over = useRef(false)
  const started = useRef(false)

  const doDrop = () => {
    if (paused || over.current) return
    started.current = true
    const top = stack.current[stack.current.length - 1]
    const level = stack.current.length
    const r = drop(moving.current, top, cfg.tol)
    if (r.cut) falling.current.push({ ...r.cut, level, y: 0, vy: 0 })
    if (!r.placed) {
      over.current = true; sfx.bad()
      const s = stack.current.length - 1
      setTimeout(() => onEnd({ score: s, won: s >= 10, message: s === 0 ? 'Whoops! Try again?' : s < 10 ? `${s} blocks high — nice building!` : `Wow, a tower ${s} blocks tall!`, emoji: '🏗️' }), 900)
      return
    }
    stack.current.push(r.placed)
    onScore(stack.current.length - 1)
    if (r.perfect) { sfx.pop(); flash.current = 1 } else sfx.tap()
    const dir = level % 2 ? -1 : 1
    moving.current = { x: dir === 1 ? 0 : 1 - r.placed.w, w: r.placed.w, dir }
  }

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const down = (e: PointerEvent) => { e.preventDefault(); doDrop() }
    const key = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); doDrop() } }
    c.addEventListener('pointerdown', down); window.addEventListener('keydown', key)
    return () => { c.removeEventListener('pointerdown', down); window.removeEventListener('keydown', key) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  const update = () => {
    const dt = STEP / 1000
    const m = moving.current
    if (!over.current) {
      const speed = cfg.speed * Math.min(1.6, 1 + stack.current.length * 0.02)
      const s = slide(m.x, m.w, m.dir, speed, dt); m.x = s.x; m.dir = s.dir
    }
    for (const f of falling.current) { f.vy += 2.5 * dt; f.y += f.vy * dt }
    falling.current = falling.current.filter((f) => f.y < 1.5)
    const target = Math.max(0, (stack.current.length + 1) * H - 0.5)
    cam.current += (target - cam.current) * 0.1
    flash.current = Math.max(0, flash.current - dt * 1.5)
  }

  const render = () => {
    const c = canvas.current
    if (!c || !size) return
    const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const g = ctx.createLinearGradient(0, 0, 0, size); g.addColorStop(0, '#2b2f6b'); g.addColorStop(1, '#ffb88a')
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size)
    const yOf = (level: number) => (GROUND - ((level + 1) * H - cam.current)) * size
    ctx.fillStyle = '#5c4a3a'; ctx.fillRect(0, yOf(-1), size, size)
    const draw = (b: Block, level: number, dy = 0) => {
      ctx.fillStyle = colour(level); rrect(ctx, b.x * size, yOf(level) + dy * size, b.w * size, H * size - 2, 6)
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(b.x * size + 4, yOf(level) + dy * size + 3, b.w * size - 8, H * size * 0.18)
    }
    stack.current.forEach((b, k) => draw(b, k))
    for (const f of falling.current) draw(f, f.level, f.y)
    if (!over.current) draw(moving.current, stack.current.length)
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'; ctx.font = `bold ${size * 0.06}px 'Plus Jakarta Sans', sans-serif`
    if (!started.current) ctx.fillText('Tap to drop!', size / 2, size * 0.18)
    if (flash.current > 0) { ctx.globalAlpha = flash.current; ctx.fillText('✨ Perfect!', size / 2, size * 0.18); ctx.globalAlpha = 1 }
  }

  useGameLoop(!paused, STEP, update, render)
  return <div className="stage"><canvas ref={canvas} aria-label="Stack Tower — tap to drop the block" /></div>
}
