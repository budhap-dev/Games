import { useEffect, useRef, useState } from 'react'
import type { GameProps } from '../types'
import { cellAt, cellCenter, cluster, coloursPresent, floating, get, isEmpty, makeRows, remove, setCell, snapCell } from './logic'
import type { Grid, GridShape } from './logic'
import { useGameLoop } from '@/shared/useGameLoop'
import { useCanvasSize } from '@/shared/useCanvas'
import { sfx } from '@/shared/audio'

const COLORS = ['#ff5fa2', '#2d9cdb', '#ffc93c', '#3fb55b', '#7b4fd6', '#ff7a1a']
const CONFIG = {
  easy: { cols: 8, rows: 4, colours: 4, shotsPerRow: 8, maxRows: 11, match: 2 },
  normal: { cols: 9, rows: 5, colours: 5, shotsPerRow: 6, maxRows: 12, match: 2 },
  hard: { cols: 10, rows: 6, colours: 6, shotsPerRow: 5, maxRows: 12, match: 3 },
}

interface Shot { x: number; y: number; vx: number; vy: number; col: number }

export default function BubblePopGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const canvas = useRef<HTMLCanvasElement>(null)
  const size = useCanvasSize(canvas)
  const shape = useRef<GridShape>({ cols: cfg.cols, shift: 0 })
  const grid = useRef<Grid>(makeRows(cfg.rows, shape.current, cfg.colours, Math.random))
  const shot = useRef<Shot | null>(null)
  const angle = useRef(-Math.PI / 2)
  const aiming = useRef(false)
  const current = useRef(Math.floor(Math.random() * cfg.colours))
  const next = useRef(Math.floor(Math.random() * cfg.colours))
  const shots = useRef(0)
  const score = useRef(0)
  const pops = useRef<{ x: number; y: number; col: number; t: number }[]>([])
  const [ended, setEnded] = useState(false)
  const endedRef = useRef(false)

  const R = () => (size ? size / (cfg.cols * 2 + 1) : 10)
  const shooter = () => [size / 2, size - R() * 1.4] as const

  const pickColour = () => {
    const present = coloursPresent(grid.current)
    return present.length ? present[Math.floor(Math.random() * present.length)] : 0
  }

  const finish = (won: boolean) => {
    if (endedRef.current) return
    endedRef.current = true; setEnded(true)
    won ? sfx.win() : sfx.lose()
    setTimeout(() => onEnd({ score: score.current, won, message: won ? 'You popped them all!' : `Great popping! ${score.current} bubbles`, emoji: won ? '🎉' : '🫧' }), 500)
  }

  const fire = () => {
    if (shot.current || paused || endedRef.current) return
    const [sx, sy] = shooter()
    const sp = size * 0.022
    shot.current = { x: sx, y: sy, vx: Math.cos(angle.current) * sp, vy: Math.sin(angle.current) * sp, col: current.current }
    current.current = next.current
    next.current = pickColour()
    sfx.tap()
  }

  const setAngle = (px: number, py: number) => {
    const [sx, sy] = shooter()
    let a = Math.atan2(py - sy, px - sx)
    const min = -Math.PI + 0.2, max = -0.2
    if (a > 0) a = px < sx ? min : max
    angle.current = Math.max(min, Math.min(max, a))
  }

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const pos = (e: PointerEvent) => { const b = c.getBoundingClientRect(); return [((e.clientX - b.left) / b.width) * size, ((e.clientY - b.top) / b.height) * size] as const }
    const down = (e: PointerEvent) => { aiming.current = true; const [x, y] = pos(e); setAngle(x, y); c.setPointerCapture(e.pointerId) }
    const move = (e: PointerEvent) => { const [x, y] = pos(e); if (aiming.current || e.pointerType === 'mouse') setAngle(x, y) }
    const up = () => { if (aiming.current) { aiming.current = false; fire() } }
    c.addEventListener('pointerdown', down); c.addEventListener('pointermove', move); c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up)
    return () => { c.removeEventListener('pointerdown', down); c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', up); c.removeEventListener('pointercancel', up) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, paused])

  const land = (s: Shot) => {
    const r = R()
    let [row, col] = cellAt(s.x, s.y, r, shape.current)
    ;[row, col] = snapCell(grid.current, row, col, shape.current, r, s.x, s.y)
    grid.current = setCell(grid.current, row, col, s.col)
    const cl = cluster(grid.current, row, col, shape.current)
    let removed: [number, number][] = []
    if (cl.length >= cfg.match) { // touch the same colour → pop (Hard needs a group of 3)
      grid.current = remove(grid.current, cl)
      removed = cl
      const fl = floating(grid.current, shape.current)
      grid.current = remove(grid.current, fl)
      removed = removed.concat(fl)
    }
    if (removed.length) {
      sfx.pop()
      score.current += removed.length
      onScore(score.current)
      for (const [rr, cc] of removed) { const [x, y] = cellCenter(rr, cc, r, shape.current); pops.current.push({ x, y, col: s.col, t: 1 }) }
    } else sfx.flip()
    shots.current++
    if (isEmpty(grid.current)) { finish(true); return }
    if (shots.current % cfg.shotsPerRow === 0) {
      const newRow = makeRows(1, shape.current, cfg.colours, Math.random)[0]
      grid.current = [newRow, ...grid.current]
      shape.current = { ...shape.current, shift: 1 - shape.current.shift }
    }
    if (grid.current.some((rowArr, ri) => ri >= cfg.maxRows && rowArr.some((v) => v !== null))) finish(false)
    if (!coloursPresent(grid.current).includes(current.current)) current.current = pickColour()
  }

  const update = () => {
    const s = shot.current
    if (!s) return
    const r = R()
    s.x += s.vx; s.y += s.vy
    if (s.x < r) { s.x = r; s.vx = -s.vx }
    if (s.x > size - r) { s.x = size - r; s.vx = -s.vx }
    let hit = s.y <= r
    if (!hit) {
      outer: for (let ri = 0; ri < grid.current.length; ri++) for (let ci = 0; ci < cfg.cols; ci++) {
        if (get(grid.current, ri, ci) === null) continue
        const [cx, cy] = cellCenter(ri, ci, r, shape.current)
        if ((cx - s.x) ** 2 + (cy - s.y) ** 2 < (r * 1.85) ** 2) { hit = true; break outer }
      }
    }
    if (hit) { shot.current = null; land(s) }
    for (const p of pops.current) p.t -= 0.06
    pops.current = pops.current.filter((p) => p.t > 0)
  }

  const render = () => {
    const c = canvas.current
    if (!c || !size) return
    const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const r = R()
    ctx.fillStyle = '#e9f4ff'; ctx.fillRect(0, 0, size, size)
    // danger line
    const dy = r + cfg.maxRows * r * Math.sqrt(3) - r
    ctx.strokeStyle = 'rgba(255,95,162,.5)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(0, dy); ctx.lineTo(size, dy); ctx.stroke(); ctx.setLineDash([])
    const drawBubble = (x: number, y: number, col: number, rad = r, alpha = 1) => {
      ctx.globalAlpha = alpha
      ctx.fillStyle = COLORS[col]; ctx.beginPath(); ctx.arc(x, y, rad * 0.92, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(x - rad * 0.3, y - rad * 0.3, rad * 0.28, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
    }
    grid.current.forEach((row, ri) => row.forEach((v, ci) => { if (v !== null) { const [x, y] = cellCenter(ri, ci, r, shape.current); drawBubble(x, y, v) } }))
    for (const p of pops.current) drawBubble(p.x, p.y, p.col, r * (1 + (1 - p.t) * 0.8), p.t)
    // aim line
    const [sx, sy] = shooter()
    if (!shot.current && !endedRef.current) {
      ctx.strokeStyle = 'rgba(29,33,64,.35)'; ctx.setLineDash([4, 8]); ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(angle.current) * size * 0.35, sy + Math.sin(angle.current) * size * 0.35); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1
    }
    // shooter base + bubbles
    ctx.fillStyle = '#1d2140'; ctx.beginPath(); ctx.arc(sx, sy, r * 1.25, 0, Math.PI * 2); ctx.fill()
    if (!endedRef.current) drawBubble(sx, sy, current.current)
    drawBubble(sx + r * 3.2, sy + r * 0.2, next.current, r * 0.6)
    ctx.fillStyle = '#1d2140'; ctx.font = `bold ${r * 0.8}px Fredoka, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('next', sx + r * 3.2, sy - r * 0.9)
    if (shot.current) drawBubble(shot.current.x, shot.current.y, shot.current.col)
  }

  useGameLoop(!paused && !ended, 16, update, render)

  return <div className="stage"><canvas ref={canvas} aria-label="Bubble Pop — drag to aim, release to fire" /></div>
}
