import { useRef, useState } from 'react'
import type { GameProps, GameStep } from '@/games/types'
import { DIRS, flip, litTargets, makePuzzle, puzzlePoints, solved, trace } from './logic'
import type { Mirrors } from './logic'
import { sfx } from '@/shared/audio'

const ROUNDS = 5
const C = 60, PAD = 40

export default function LaserGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const [p, setP] = useState(() => makePuzzle(difficulty))
  const [mirrors, setMirrors] = useState<Mirrors>(p.start)
  const [n, setN] = useState(1)
  const [taps, setTaps] = useState(0)
  const [total, setTotal] = useState(0)
  const [done, setDone] = useState(false)
  const log = useRef<GameStep[]>([])
  const beam = trace(p.n, p.row, mirrors)
  const lit = litTargets(p, mirrors)
  const cx = (i: number) => PAD + (i % p.n) * C + C / 2, cy = (i: number) => Math.floor(i / p.n) * C + C / 2

  const tap = (i: number) => {
    if (paused || done) return
    const m = { ...mirrors, [i]: flip(mirrors[i]) }
    const t = taps + 1
    setMirrors(m); setTaps(t); sfx.flip()
    if (!solved(p, m)) return
    const pts = puzzlePoints(t, p.par), tot = total + pts
    setDone(true); setTotal(tot); onScore(tot); sfx.good()
    log.current = [...log.current, { move: `Puzzle ${n}`, result: `${t} tap${t === 1 ? '' : 's'} (par ${p.par}) · +${pts}`, ok: t <= p.par }]
    setTimeout(() => {
      if (n >= ROUNDS) {
        onEnd({ score: tot, won: tot >= ROUNDS * 7, message: tot === ROUNDS * 10 ? 'Flawless optics!' : `${tot} points — the lab is lit!`, emoji: '🔦', steps: log.current, stepsTitle: 'Your puzzles' })
        return
      }
      const np = makePuzzle(difficulty)
      setP(np); setMirrors(np.start); setN(n + 1); setTaps(0); setDone(false)
    }, 1300)
  }

  const last = beam.cells[beam.cells.length - 1]
  const pts = [`${PAD - 18},${p.row * C + C / 2}`, ...beam.cells.map((i) => `${cx(i)},${cy(i)}`), `${cx(last) + DIRS[beam.dir][1] * (C / 2)},${cy(last) + DIRS[beam.dir][0] * (C / 2)}`]
  const W = PAD + p.n * C + 6
  return (
    <>
      <div className="turn">Puzzle {n} / {ROUNDS} · 🎯 {lit.length}/{p.targets.length} · {total} pts</div>
      <svg className="laser" viewBox={`0 0 ${W} ${p.n * C}`} role="group" aria-label="Laser lab: tap a mirror to turn it">
        {Array.from({ length: p.n * p.n }, (_, i) => <rect key={i} className="lz-cell" x={PAD + (i % p.n) * C + 1} y={Math.floor(i / p.n) * C + 1} width={C - 2} height={C - 2} rx={6} />)}
        {p.targets.map((t) => <circle key={t} className={`lz-target ${lit.includes(t) ? 'on' : ''}`} cx={cx(t)} cy={cy(t)} r={16} />)}
        <polyline className="lz-beam" points={pts.join(' ')} />
        <text className="lz-source" x={PAD - 22} y={p.row * C + C / 2}>🔦</text>
        {Object.entries(mirrors).map(([k, m]) => {
          const i = +k, x = PAD + (i % p.n) * C, y = Math.floor(i / p.n) * C
          return (
            <g key={k} className="lz-mirror" onClick={() => tap(i)} role="button" tabIndex={0} aria-label={`Mirror ${m === '/' ? 'leaning right' : 'leaning left'}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(i) } }}>
              <rect x={x} y={y} width={C} height={C} />
              {m === '/' ? <line x1={x + 10} y1={y + C - 10} x2={x + C - 10} y2={y + 10} /> : <line x1={x + 10} y1={y + 10} x2={x + C - 10} y2={y + C - 10} />}
            </g>
          )
        })}
      </svg>
      <p className="muted center" style={{ margin: 0 }}>{done ? `✨ Lit! ${puzzlePoints(taps, p.par)} points` : `Tap mirrors to steer the beam onto ${p.targets.length > 1 ? 'both targets' : 'the target'}. Taps: ${taps}`}</p>
    </>
  )
}
