import { useEffect, useRef } from 'react'
import type { GameProps, GameStep } from '../types'
import { BOARD_H, aimFromDrag, bounceBoard, describeThrow, path, spawnHoop, stepBall, throughHoop } from './logic'
import type { Ball, Hoop } from './logic'
import { useGameLoop } from '@/shared/useGameLoop'
import { useCanvasSize, rrect } from '@/shared/useCanvas'
import { sfx } from '@/shared/audio'

const CONFIG = {
  easy: { hoopW: 0.17, guide: 70, wind: 0 },
  normal: { hoopW: 0.14, guide: 16, wind: 0 },
  hard: { hoopW: 0.12, guide: 0, wind: 0.4 },
}
const STEP = 16, G = 1.6, R = 0.032, K = 3.2, MAXV = 2.1, GROUND = 0.94, BALLS = 10
const HOME: Ball = { x: 0.14, y: 0.8, vx: 0, vy: 0 }

export default function HoopGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const canvas = useRef<HTMLCanvasElement>(null)
  const size = useCanvasSize(canvas)
  const ball = useRef<Ball>({ ...HOME })
  const flying = useRef(false)
  const scoredThis = useRef(false)
  const hoop = useRef<Hoop>(spawnHoop(cfg.hoopW))
  const wind = useRef(0)
  const aim = useRef({ vx: 1.5 * Math.cos(1), vy: -1.5 * Math.sin(1) })
  const drag = useRef<{ x: number; y: number } | null>(null)
  const left = useRef(BALLS)
  const score = useRef(0)
  const flash = useRef(0)
  const over = useRef(false)
  const touched = useRef(false)
  const steps = useRef<GameStep[]>([])
  const shot = useRef('')

  const launch = () => {
    if (paused || flying.current || over.current) return
    touched.current = true
    ball.current = { ...HOME, ...aim.current }
    shot.current = describeThrow(aim.current.vx, aim.current.vy, difficulty === 'hard' ? wind.current : undefined)
    flying.current = true; scoredThis.current = false; sfx.flip()
  }
  const endThrow = () => {
    flying.current = false
    left.current--
    steps.current.push({ move: `Throw ${BALLS - left.current}`, result: `${shot.current} → ${scoredThis.current ? 'Swish!' : 'miss'}`, ok: scoredThis.current })
    if (scoredThis.current || difficulty === 'hard') hoop.current = spawnHoop(cfg.hoopW)
    if (difficulty === 'hard') wind.current = (Math.random() * 2 - 1) * cfg.wind
    ball.current = { ...HOME }
    if (left.current <= 0) {
      over.current = true
      const s = score.current, st = [...steps.current]
      setTimeout(() => onEnd({ score: s, won: s >= 5, message: s === BALLS ? 'Ten out of ten! Superstar!' : s >= 5 ? `${s} baskets — great aim!` : `${s} baskets — keep practising!`, emoji: '🏀', steps: st }), 400)
    }
  }

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const at = (e: PointerEvent) => { const b = c.getBoundingClientRect(); return { x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height } }
    const down = (e: PointerEvent) => { if (paused || flying.current || over.current) return; e.preventDefault(); c.setPointerCapture(e.pointerId); drag.current = at(e); touched.current = true }
    const move = (e: PointerEvent) => { if (!drag.current) return; const p = at(e); aim.current = aimFromDrag(drag.current.x - p.x, drag.current.y - p.y, K, MAXV) }
    const up = (e: PointerEvent) => { if (!drag.current) return; const p = at(e); const far = Math.hypot(drag.current.x - p.x, drag.current.y - p.y) > 0.04; drag.current = null; if (far) launch() }
    const key = (e: KeyboardEvent) => {
      const a = aim.current, ang = Math.atan2(-a.vy, a.vx), sp = Math.hypot(a.vx, a.vy)
      const set = (an: number, s: number) => { s = Math.max(0.4, Math.min(MAXV, s)); aim.current = { vx: s * Math.cos(an), vy: -s * Math.sin(an) }; touched.current = true }
      if (e.key === 'ArrowUp') set(ang + 0.05, sp)
      else if (e.key === 'ArrowDown') set(ang - 0.05, sp)
      else if (e.key === 'ArrowRight') set(ang, sp + 0.05)
      else if (e.key === 'ArrowLeft') set(ang, sp - 0.05)
      else if (e.key === ' ' || e.key === 'Enter') launch()
      else return
      e.preventDefault()
    }
    c.addEventListener('pointerdown', down); c.addEventListener('pointermove', move); c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up)
    window.addEventListener('keydown', key)
    return () => { c.removeEventListener('pointerdown', down); c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', up); c.removeEventListener('pointercancel', up); window.removeEventListener('keydown', key) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  const update = () => {
    const dt = STEP / 1000
    flash.current = Math.max(0, flash.current - dt * 1.2)
    if (!flying.current) return
    const prev = ball.current
    let b = stepBall(prev, G, wind.current, dt)
    b = bounceBoard(prev, b, hoop.current, R)
    if (!scoredThis.current && throughHoop(prev, b, hoop.current, R)) {
      scoredThis.current = true; score.current++; onScore(score.current); flash.current = 1; sfx.good()
      b = { ...b, vx: b.vx * 0.3 }
    }
    ball.current = b
    if (b.y > GROUND || b.x > 1.1 || b.x < -0.1) endThrow()
  }

  const render = () => {
    const c = canvas.current
    if (!c || !size) return
    const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const g = ctx.createLinearGradient(0, 0, 0, size); g.addColorStop(0, '#9fd8ff'); g.addColorStop(1, '#e8f6ff')
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = '#e9b97a'; ctx.fillRect(0, GROUND * size, size, size)
    const h = hoop.current, S = size
    // backboard, pole, rim, net
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1d2140'; ctx.lineWidth = 2
    ctx.fillRect((h.x + h.w + 0.01) * S, (h.y - BOARD_H) * S, 0.02 * S, (BOARD_H + 0.03) * S)
    ctx.strokeRect((h.x + h.w + 0.01) * S, (h.y - BOARD_H) * S, 0.02 * S, (BOARD_H + 0.03) * S)
    ctx.fillStyle = '#8a93b8'; ctx.fillRect((h.x + h.w + 0.02) * S, (h.y + 0.03) * S, 0.012 * S, (GROUND - h.y - 0.03) * S)
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5
    for (let k = 0; k <= 4; k++) { ctx.beginPath(); ctx.moveTo((h.x + (h.w * k) / 4) * S, h.y * S); ctx.lineTo((h.x + h.w * 0.2 + (h.w * 0.6 * k) / 4) * S, (h.y + 0.08) * S); ctx.stroke() }
    // aiming guide
    if (!flying.current && !over.current) {
      const a = { ...HOME, ...aim.current }
      ctx.fillStyle = 'rgba(29,33,64,.45)'
      path(a, G, wind.current, 1 / 60, cfg.guide).forEach((p, k) => { if (k % 4 === 0) { ctx.beginPath(); ctx.arc(p.x * S, p.y * S, 3, 0, Math.PI * 2); ctx.fill() } })
      ctx.strokeStyle = '#ff7a1a'; ctx.lineWidth = 4; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(HOME.x * S, HOME.y * S); ctx.lineTo((HOME.x + a.vx * 0.08) * S, (HOME.y + a.vy * 0.08) * S); ctx.stroke()
    }
    // ball (drawn after the net, rim on top so it looks like it drops through)
    ctx.font = `${R * 2.4 * S}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('🏀', ball.current.x * S, ball.current.y * S)
    ctx.fillStyle = '#ff5a1f'; rrect(ctx, h.x * S, (h.y - 0.008) * S, h.w * S, 0.016 * S, 3)
    // HUD
    ctx.fillStyle = '#1d2140'; ctx.font = `bold ${S * 0.05}px 'Plus Jakarta Sans', sans-serif`; ctx.textAlign = 'left'
    ctx.fillText(`🏀 × ${left.current}`, S * 0.04, S * 0.07)
    if (difficulty === 'hard') { ctx.textAlign = 'right'; ctx.fillText(`💨 ${wind.current >= 0 ? '→' : '←'} ${Math.round(Math.abs(wind.current) * 10)}`, S * 0.96, S * 0.07) }
    ctx.textAlign = 'center'
    if (!touched.current) ctx.fillText('Pull back and let go!', S / 2, S * 0.18)
    if (flash.current > 0) { ctx.globalAlpha = flash.current; ctx.fillText('Swish! 🎉', S / 2, S * 0.18); ctx.globalAlpha = 1 }
  }

  useGameLoop(!paused, STEP, update, render)
  return <div className="stage"><canvas ref={canvas} aria-label="Hoop Toss — drag back from anywhere and let go to throw; arrow keys aim, space throws" /></div>
}
