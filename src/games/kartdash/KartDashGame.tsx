import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameProps } from '../types'
import { useGameLoop } from '@/shared/useGameLoop'
import { useCanvasSize, rrect } from '@/shared/useCanvas'
import { useDirectionInput } from '@/shared/useInput'
import type { Dir } from '@/shared/useInput'
import { sfx } from '@/shared/audio'

const CONFIG = {
  easy: { speed: 0.55, spawnMs: 900, starChance: 0.7, track: 45 },
  normal: { speed: 0.75, spawnMs: 750, starChance: 0.55, track: 60 },
  hard: { speed: 1.0, spawnMs: 600, starChance: 0.45, track: 75 },
}
type Kind = 'star' | 'puddle' | 'cone'
interface Item { lane: number; y: number; kind: Kind; hit?: boolean }
const EMOJI: Record<Kind, string> = { star: '⭐', puddle: '💧', cone: '🚧' }
const STEP = 16

export default function KartDashGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const canvas = useRef<HTMLCanvasElement>(null)
  const size = useCanvasSize(canvas)
  const lane = useRef(1)
  const kx = useRef(0.5) // kart x as fraction of road width (lerps to lane)
  const items = useRef<Item[]>([])
  const speedMul = useRef(1)
  const dist = useRef(0) // seconds of full-speed travel
  const spawnT = useRef(0)
  const stars = useRef(0)
  const dash = useRef(0)
  const wobble = useRef(0)
  const [countdown, setCountdown] = useState(3)
  const [ended, setEnded] = useState(false)
  const endedRef = useRef(false)

  useEffect(() => {
    if (paused || countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 700)
    return () => clearTimeout(t)
  }, [countdown, paused])

  const steer = useCallback((d: Dir) => {
    if (paused || endedRef.current) return
    if (d === 'left' && lane.current > 0) { lane.current--; sfx.tap() }
    if (d === 'right' && lane.current < 2) { lane.current++; sfx.tap() }
  }, [paused])
  useDirectionInput(steer, !paused)

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const onDown = (e: PointerEvent) => { const b = c.getBoundingClientRect(); steer(e.clientX - b.left < b.width / 2 ? 'left' : 'right') }
    c.addEventListener('pointerdown', onDown)
    return () => c.removeEventListener('pointerdown', onDown)
  }, [steer])

  const finish = () => {
    if (endedRef.current) return
    endedRef.current = true; setEnded(true); sfx.win()
    setTimeout(() => onEnd({ score: stars.current, won: true, message: `Finish line! ${stars.current} stars!`, emoji: '🏁' }), 600)
  }

  const update = () => {
    if (endedRef.current) return
    const dt = STEP / 1000
    const v = cfg.speed * speedMul.current
    speedMul.current = Math.min(1, speedMul.current + dt * 0.6)
    dist.current += v * dt
    dash.current = (dash.current + v * 1.2) % 1
    kx.current += ((lane.current + 0.5) / 3 - kx.current) * 0.25
    wobble.current *= 0.9
    spawnT.current += STEP
    if (spawnT.current >= cfg.spawnMs / Math.max(0.4, v)) {
      spawnT.current = 0
      const r = Math.random()
      const kind: Kind = r < cfg.starChance ? 'star' : r < cfg.starChance + (1 - cfg.starChance) / 2 ? 'puddle' : 'cone'
      items.current.push({ lane: Math.floor(Math.random() * 3), y: -0.1, kind })
    }
    for (const it of items.current) {
      it.y += v * dt * 0.9
      if (!it.hit && it.y > 0.78 && it.y < 0.9 && it.lane === lane.current) {
        it.hit = true
        if (it.kind === 'star') { stars.current++; onScore(stars.current); sfx.pop() }
        else { speedMul.current = 0.35; wobble.current = 1; sfx.bad() }
      }
    }
    items.current = items.current.filter((it) => it.y < 1.2 && !(it.hit && it.kind === 'star'))
    if (dist.current >= cfg.track * cfg.speed) finish()
  }

  const render = () => {
    const c = canvas.current
    if (!c || !size) return
    const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const roadX = size * 0.12, roadW = size * 0.76
    ctx.fillStyle = '#9be38a'; ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = '#5b6270'; ctx.fillRect(roadX, 0, roadW, size)
    ctx.fillStyle = '#ffffff'
    for (let l = 1; l < 3; l++) {
      const x = roadX + (roadW / 3) * l
      for (let y = -size * 0.1 + dash.current * size * 0.1; y < size; y += size * 0.1) ctx.fillRect(x - 3, y, 6, size * 0.05)
    }
    ctx.fillStyle = '#ff5fa2'; ctx.fillRect(roadX - 8, 0, 8, size); ctx.fillRect(roadX + roadW, 0, 8, size)
    const fs = roadW / 3 * 0.55
    ctx.font = `${fs}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    for (const it of items.current) {
      if (it.hit && it.kind === 'star') continue
      ctx.fillText(EMOJI[it.kind], roadX + (roadW / 3) * (it.lane + 0.5), it.y * size)
    }
    // kart
    const kxp = roadX + kx.current * roadW, kyp = size * 0.84
    ctx.save(); ctx.translate(kxp, kyp); ctx.rotate(Math.sin(Date.now() / 40) * wobble.current * 0.25)
    ctx.font = `${fs * 1.15}px serif`; ctx.fillText('🏎️', 0, 0); ctx.restore()
    // progress
    const p = Math.min(1, dist.current / (cfg.track * cfg.speed))
    ctx.fillStyle = 'rgba(29,33,64,.25)'; rrect(ctx, size * 0.1, 12, size * 0.8, 14, 7)
    ctx.fillStyle = '#ffc93c'; rrect(ctx, size * 0.1, 12, size * 0.8 * p, 14, 7)
    ctx.font = `${size * 0.05}px serif`; ctx.fillText('🏁', size * 0.9 + 14, 19)
    if (countdown > 0) {
      ctx.fillStyle = 'rgba(29,33,64,.35)'; ctx.fillRect(0, 0, size, size)
      ctx.fillStyle = '#fff'; ctx.font = `bold ${size * 0.3}px Fredoka, sans-serif`
      ctx.fillText(String(countdown), size / 2, size / 2)
    }
  }

  useGameLoop(!paused && countdown <= 0 && !ended, STEP, update, render)

  return (
    <>
      <div className="stage"><canvas ref={canvas} aria-label="Kart Dash — tap left or right to change lanes" /></div>
      <div className="kart-btns">
        <button aria-label="Left lane" onPointerDown={(e) => { e.preventDefault(); steer('left') }}>◀</button>
        <button aria-label="Right lane" onPointerDown={(e) => { e.preventDefault(); steer('right') }}>▶</button>
      </div>
    </>
  )
}
