import { useEffect, useRef, useState } from 'react'
import type { GameProps } from '../types'
import { BEE_R, BEE_X, PIPE_W, collides, flap, spawnPipe, stepBee } from './logic'
import type { Bee, Pipe } from './logic'
import { useGameLoop } from '@/shared/useGameLoop'
import { useCanvasSize, rrect } from '@/shared/useCanvas'
import { sfx } from '@/shared/audio'

const CONFIG = {
  easy: { gap: 0.36, speed: 0.28, gravity: 1.6, power: 0.62, spacing: 0.62 },
  normal: { gap: 0.3, speed: 0.34, gravity: 1.9, power: 0.66, spacing: 0.58 },
  hard: { gap: 0.25, speed: 0.42, gravity: 2.2, power: 0.7, spacing: 0.55 },
}
const STEP = 16

export default function FlappyGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const canvas = useRef<HTMLCanvasElement>(null)
  const size = useCanvasSize(canvas)
  const bee = useRef<Bee>({ y: 0.45, vy: 0 })
  const pipes = useRef<Pipe[]>([])
  const started = useRef(false)
  const score = useRef(0)
  const wing = useRef(0)
  const [ended, setEnded] = useState(false)
  const endedRef = useRef(false)

  const doFlap = () => {
    if (paused || endedRef.current) return
    if (!started.current) { started.current = true; pipes.current = [spawnPipe(1.1), spawnPipe(1.1 + cfg.spacing)] }
    flap(bee.current, cfg.power); wing.current = 1; sfx.tap()
  }

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const down = (e: PointerEvent) => { e.preventDefault(); doFlap() }
    const key = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); doFlap() } }
    c.addEventListener('pointerdown', down); window.addEventListener('keydown', key)
    return () => { c.removeEventListener('pointerdown', down); window.removeEventListener('keydown', key) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  const update = () => {
    if (endedRef.current) return
    const dt = STEP / 1000
    wing.current *= 0.85
    if (!started.current) { bee.current.y = 0.45 + Math.sin(Date.now() / 300) * 0.02; return }
    stepBee(bee.current, cfg.gravity, dt)
    for (const p of pipes.current) {
      p.x -= cfg.speed * dt
      if (!p.passed && p.x + PIPE_W < BEE_X) { p.passed = true; score.current++; onScore(score.current); sfx.pop() }
    }
    if (pipes.current[0] && pipes.current[0].x < -PIPE_W) pipes.current.shift()
    const last = pipes.current[pipes.current.length - 1]
    if (last && last.x < 1.1 - cfg.spacing) pipes.current.push(spawnPipe(last.x + cfg.spacing))
    if (collides(bee.current, pipes.current, cfg.gap)) {
      endedRef.current = true; setEnded(true); sfx.bad()
      const s = score.current
      setTimeout(() => onEnd({ score: s, won: s >= 5, message: s === 0 ? 'Bzzt! Try again?' : s < 5 ? `${s} flowers — nice flying!` : `Wow, ${s} flowers!`, emoji: '🐝' }), 600)
    }
  }

  const render = () => {
    const c = canvas.current
    if (!c || !size) return
    const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const g = ctx.createLinearGradient(0, 0, 0, size); g.addColorStop(0, '#bfe4ff'); g.addColorStop(1, '#e8f7ff')
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = '#9be38a'; ctx.fillRect(0, size * 0.95, size, size * 0.05)
    // flowers (pipes)
    for (const p of pipes.current) {
      const x = p.x * size, w = PIPE_W * size, top = (p.gapY - cfg.gap / 2) * size, bot = (p.gapY + cfg.gap / 2) * size
      ctx.fillStyle = '#3fb55b'
      rrect(ctx, x + w * 0.35, 0, w * 0.3, top - size * 0.02, 6)
      rrect(ctx, x + w * 0.35, bot + size * 0.02, w * 0.3, size * 0.95 - bot, 6)
      ctx.font = `${w * 0.9}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🌻', x + w / 2, top - w * 0.3)
      ctx.fillText('🌷', x + w / 2, bot + w * 0.3)
    }
    // bee
    ctx.save(); ctx.translate(BEE_X * size, bee.current.y * size)
    ctx.rotate(Math.max(-0.5, Math.min(0.8, bee.current.vy * 0.8)) - wing.current * 0.4)
    ctx.font = `${BEE_R * 2.6 * size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🐝', 0, 0); ctx.restore()
    if (!started.current) {
      ctx.fillStyle = '#1d2140'; ctx.font = `bold ${size * 0.055}px Fredoka, sans-serif`; ctx.textAlign = 'center'
      ctx.fillText('Tap to flap!', size / 2, size * 0.25)
    }
  }

  useGameLoop(!paused && !ended, STEP, update, render)
  return <div className="stage"><canvas ref={canvas} aria-label="Flappy Bee — tap to flap" /></div>
}
