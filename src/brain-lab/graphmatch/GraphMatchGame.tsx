import { useEffect, useRef, useState } from 'react'
import type { GameProps, GameStep } from '@/games/types'
import { formula, makeRound, roundPoints, same, yAt } from './logic'
import type { Kind, Params, Slider } from './logic'
import { sfx } from '@/shared/audio'

const ROUNDS = 6
const SPAN = 6, PX = 30, SIZE = SPAN * 2 * PX // −6..6 on both axes
const toX = (x: number) => (x + SPAN) * PX, toY = (y: number) => (SPAN - y) * PX

const curve = (kind: Kind, p: Params) => {
  const pts: string[] = []
  for (let x = -SPAN; x <= SPAN + 1e-9; x += 0.1) { const y = yAt(kind, p, x); if (Math.abs(y) < 50) pts.push(`${toX(x).toFixed(1)},${toY(y).toFixed(1)}`) }
  return pts.join(' ')
}

export default function GraphMatchGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const [round, setRound] = useState(() => makeRound(difficulty))
  const [p, setP] = useState<Params>(round.start)
  const [n, setN] = useState(1)
  const [sec, setSec] = useState(0)
  const [total, setTotal] = useState(0)
  const [matched, setMatched] = useState<number | null>(null)
  const log = useRef<GameStep[]>([])

  useEffect(() => {
    if (paused || matched !== null) return
    const t = setInterval(() => setSec((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [paused, matched])

  const change = (s: Slider, v: number) => {
    if (paused || matched !== null) return
    const np = { ...p, [s.key]: Math.max(s.min, Math.min(s.max, +v.toFixed(2))) }
    setP(np)
    if (!same(np, round.target)) return
    const pts = roundPoints(sec), t = total + pts
    setMatched(pts); setTotal(t); onScore(t); sfx.good()
    log.current = [...log.current, { move: formula(round.kind, round.target), result: `${sec}s · +${pts}`, ok: pts === 10 }]
    setTimeout(() => {
      if (n >= ROUNDS) {
        onEnd({ score: t, won: t >= 40, message: t === ROUNDS * 10 ? 'Graph genius — all lightning fast!' : `${t} points of ${ROUNDS * 10}`, emoji: '📈', steps: log.current, stepsTitle: 'Your graphs' })
        return
      }
      const nr = makeRound(difficulty)
      setRound(nr); setP(nr.start); setN(n + 1); setSec(0); setMatched(null)
    }, 1400)
  }

  const grid = Array.from({ length: SPAN * 2 + 1 }, (_, k) => k - SPAN)
  return (
    <>
      <div className="turn">Graph {n} / {ROUNDS} · ⏱ {sec}s · {total} pts</div>
      <svg className="graph" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Your graph: ${formula(round.kind, p)}. Match the dashed target.`}>
        <defs><clipPath id="gm-clip"><rect width={SIZE} height={SIZE} /></clipPath></defs>
        {grid.map((k) => <g key={k} className={k === 0 ? 'gm-axis' : 'gm-grid'}><line x1={toX(k)} x2={toX(k)} y1={0} y2={SIZE} /><line y1={toY(k)} y2={toY(k)} x1={0} x2={SIZE} /></g>)}
        {grid.filter((k) => k && k % 2 === 0 && Math.abs(k) < SPAN).map((k) => <g key={`l${k}`} className="gm-num"><text x={toX(k)} y={toY(0) + 18}>{k}</text><text x={toX(0) - 12} y={toY(k) + 5}>{k}</text></g>)}
        <g clipPath="url(#gm-clip)">
          <polyline className="gm-target" points={curve(round.kind, round.target)} />
          <polyline className={`gm-mine ${matched !== null ? 'ok' : ''}`} points={curve(round.kind, p)} />
        </g>
      </svg>
      <div className="gm-formula" aria-live="polite">{matched !== null ? `🎯 Match! +${matched}` : formula(round.kind, p)}</div>
      <div className="gm-controls">
        {round.sliders.map((s) => (
          <div key={s.key} className="gm-row">
            <span className="gm-label">{s.label}</span>
            <button className="btn icon" onClick={() => change(s, p[s.key] - s.step)} aria-label={`Decrease ${s.label}`}>−</button>
            <input type="range" min={s.min} max={s.max} step={s.step} value={p[s.key]} onChange={(e) => change(s, +e.target.value)} aria-label={s.label} />
            <button className="btn icon" onClick={() => change(s, p[s.key] + s.step)} aria-label={`Increase ${s.label}`}>+</button>
            <b className="gm-val">{p[s.key]}</b>
          </div>
        ))}
      </div>
    </>
  )
}
