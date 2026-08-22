import { useEffect, useRef, useState } from 'react'
import type { GameProps } from '../types'
import { spawn, stepItems } from './logic'
import type { Item } from './logic'
import { useGameLoop } from '@/shared/useGameLoop'
import { useCanvasSize, rrect } from '@/shared/useCanvas'
import { sfx } from '@/shared/audio'

const CONFIG = {
  easy: { speed: 0.28, spawnMs: 1100, boot: 0.12, basket: 0.24, secs: 45 },
  normal: { speed: 0.38, spawnMs: 850, boot: 0.2, basket: 0.2, secs: 45 },
  hard: { speed: 0.5, spawnMs: 650, boot: 0.28, basket: 0.17, secs: 45 },
}
const STEP = 16

export default function FruitCatchGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const canvas = useRef<HTMLCanvasElement>(null)
  const size = useCanvasSize(canvas)
  const basketX = useRef(0.5)
  const items = useRef<Item[]>([])
  const keys = useRef({ left: false, right: false })
  const spawnT = useRef(0)
  const score = useRef(0)
  const boots = useRef(0)
  const timeLeft = useRef(cfg.secs * 1000)
  const wobble = useRef(0)
  const [, force] = useState(0)
  const ended = useRef(false)

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const move = (e: PointerEvent) => { const b = c.getBoundingClientRect(); basketX.current = Math.max(cfg.basket / 2, Math.min(1 - cfg.basket / 2, (e.clientX - b.left) / b.width)) }
    const down = (e: PointerEvent) => { move(e); c.setPointerCapture(e.pointerId) }
    const key = (e: KeyboardEvent, on: boolean) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') { keys.current.left = on; e.preventDefault() }
      if (e.key === 'ArrowRight' || e.key === 'd') { keys.current.right = on; e.preventDefault() }
    }
    const kd = (e: KeyboardEvent) => key(e, true), ku = (e: KeyboardEvent) => key(e, false)
    c.addEventListener('pointermove', move); c.addEventListener('pointerdown', down)
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku)
    return () => { c.removeEventListener('pointermove', move); c.removeEventListener('pointerdown', down); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku) }
  }, [cfg.basket])

  const finish = () => {
    if (ended.current) return
    ended.current = true
    const s = score.current
    if (s >= 10) sfx.win(); else sfx.good()
    setTimeout(() => onEnd({ score: s, won: s >= 10, message: boots.current >= 3 ? `Too many boots! ${s} fruit caught` : `Time’s up! ${s} fruit caught`, emoji: s >= 20 ? '🍉' : '🧺' }), 500)
  }

  const update = () => {
    if (ended.current) return
    const dt = STEP / 1000
    timeLeft.current -= STEP
    if (keys.current.left) basketX.current = Math.max(cfg.basket / 2, basketX.current - 0.02)
    if (keys.current.right) basketX.current = Math.min(1 - cfg.basket / 2, basketX.current + 0.02)
    wobble.current *= 0.9
    spawnT.current += STEP
    if (spawnT.current >= cfg.spawnMs) { spawnT.current = 0; items.current.push(spawn(cfg.boot, cfg.speed)) }
    const r = stepItems(items.current, basketX.current, cfg.basket, dt)
    items.current = r.remaining
    for (const it of r.caught) {
      if (it.kind === 'fruit') { score.current++; onScore(score.current); sfx.pop() }
      else { boots.current++; wobble.current = 1; sfx.bad(); force((n) => n + 1) }
    }
    if (boots.current >= 3 || timeLeft.current <= 0) finish()
  }

  const render = () => {
    const c = canvas.current
    if (!c || !size) return
    const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const g = ctx.createLinearGradient(0, 0, 0, size); g.addColorStop(0, '#cfeaff'); g.addColorStop(1, '#e9f7ea')
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = '#9be38a'; ctx.fillRect(0, size * 0.95, size, size * 0.05)
    ctx.font = `${size * 0.08}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    for (const it of items.current) ctx.fillText(it.emoji, it.x * size, it.y * size)
    // basket
    const bw = cfg.basket * size, bx = basketX.current * size - bw / 2, by = size * 0.88
    ctx.save(); ctx.translate(bx + bw / 2, by); ctx.rotate(Math.sin(Date.now() / 40) * wobble.current * 0.2); ctx.translate(-(bx + bw / 2), -by)
    ctx.fillStyle = '#c98a3a'; rrect(ctx, bx, by, bw, size * 0.07, 10)
    ctx.fillStyle = '#a86f2a'; rrect(ctx, bx, by, bw, size * 0.02, 6)
    ctx.restore()
    // HUD
    ctx.font = `${size * 0.05}px serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    ctx.fillText('🥾'.repeat(boots.current) + '⚪'.repeat(Math.max(0, 3 - boots.current)), 10, 8)
    ctx.fillStyle = '#1d2140'; ctx.font = `bold ${size * 0.05}px Fredoka, sans-serif`; ctx.textAlign = 'right'
    ctx.fillText(`⏱ ${Math.max(0, Math.ceil(timeLeft.current / 1000))}s`, size - 10, 8)
  }

  useGameLoop(!paused, STEP, update, render)
  return <div className="stage"><canvas ref={canvas} aria-label="Fruit Catch — slide to move the basket" /></div>
}
