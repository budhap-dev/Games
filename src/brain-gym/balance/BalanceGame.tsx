import { useState } from 'react'
import type { GameProps, GameStep } from '@/games/types'
import { makeRound, stars, tilt, turning } from './logic'
import type { Block } from './logic'
import { sfx } from '@/shared/audio'

const ROUNDS = 6
const MID = 200, BEAM_Y = 130

/** Blocks stacked on their pegs, drawn on one side of the beam (-1 left, 1 right). */
function Stacks({ blocks, side, gap, cls }: { blocks: Block[]; side: -1 | 1; gap: number; cls: string }) {
  const height: Record<number, number> = {}
  const bw = Math.min(40, gap - 4)
  return (
    <>
      {blocks.map((b, k) => {
        const h = (height[b.d] = (height[b.d] ?? 0) + 1)
        const x = MID + side * b.d * gap - bw / 2, y = BEAM_Y - 6 - h * 28
        return (
          <g key={k} className={cls}>
            <rect x={x} y={y} width={bw} height={26} rx={5} />
            <text x={x + bw / 2} y={y + 14}>{b.w}</text>
          </g>
        )
      })}
    </>
  )
}

export default function BalanceGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const [round, setRound] = useState(() => makeRound(difficulty))
  const [n, setN] = useState(1)
  const [right, setRight] = useState<Block[]>([])
  const [w, setW] = useState(round.tray[0])
  const [total, setTotal] = useState(0)
  const [hist, setHist] = useState<GameStep[]>([])
  const [won, setWon] = useState<number | null>(null) // stars for this round once balanced
  const L = turning(round.left), R = turning(right)
  const gap = 175 / round.pegs
  const busy = paused || won !== null

  const place = (d: number) => {
    if (busy) return
    const nr = [...right, { d, w }]
    setRight(nr); sfx.tap()
    if (turning(nr) !== L) return
    const s = stars(nr.length, round.best), t = total + s
    const h = [...hist, { move: `Scale ${n}`, result: `${nr.length} blocks (best ${round.best}) · ${'⭐'.repeat(s)}`, ok: s === 3 || undefined }]
    setWon(s); setTotal(t); onScore(t); setHist(h); sfx.good()
    setTimeout(() => {
      if (n >= ROUNDS) {
        const max = ROUNDS * 3
        onEnd({ score: t, won: t >= 12, message: t === max ? 'Perfectly balanced, every time!' : t >= 12 ? `Great balancing! ${t} of ${max} stars` : `${t} of ${max} stars — try fewer blocks!`, emoji: '⚖️', steps: h, stepsTitle: 'Your scales' })
        return
      }
      setN(n + 1); setRound(makeRound(difficulty)); setRight([]); setWon(null)
    }, 1500)
  }
  const undo = () => { if (!busy && right.length) { sfx.flip(); setRight(right.slice(0, -1)) } }

  return (
    <>
      <div className="turn">Scale {n} / {ROUNDS} · ⭐ {total}</div>
      <svg className="balance" viewBox="0 0 400 230" role="img" aria-label={`See-saw: left side pulls ${L}, right side pulls ${R}`}>
        <polygon className="bal-pivot" points={`${MID},${BEAM_Y + 8} ${MID - 30},${BEAM_Y + 80} ${MID + 30},${BEAM_Y + 80}`} />
        <g className="bal-beam" style={{ transform: `rotate(${tilt(L, R)}deg)`, transformOrigin: `${MID}px ${BEAM_Y}px` }}>
          <rect x={14} y={BEAM_Y - 6} width={372} height={12} rx={6} />
          {Array.from({ length: round.pegs }, (_, k) => k + 1).flatMap((d) => [-1, 1].map((s) => (
            <g key={`${s}${d}`} className="bal-peg">
              <circle cx={MID + s * d * gap} cy={BEAM_Y} r={4} />
              <text x={MID + s * d * gap} y={BEAM_Y + 24}>{d}</text>
            </g>
          )))}
          <Stacks blocks={round.left} side={-1} gap={gap} cls="bal-block left" />
          <Stacks blocks={right} side={1} gap={gap} cls="bal-block right" />
        </g>
      </svg>
      {difficulty !== 'hard' && (
        <div className={`howto center ${won !== null ? 'bal-ok' : ''}`} aria-live="polite">
          {won !== null ? `⚖️ Balanced! ${'⭐'.repeat(won)}` : <>Left pulls <b>{L}</b> · Right pulls <b>{R}</b> <span className="muted">(weight × peg)</span></>}
        </div>
      )}
      {difficulty === 'hard' && won !== null && <div className="howto center bal-ok" aria-live="polite">⚖️ Balanced! {'⭐'.repeat(won)}</div>}
      <div className="seg" role="group" aria-label="Pick a weight">
        {round.tray.map((t) => <button key={t} aria-pressed={w === t} onClick={() => { sfx.tap(); setW(t) }}>🧱 {t}</button>)}
      </div>
      <div className="bal-pegs" role="group" aria-label="Put it on a right-hand peg">
        <span className="muted">Peg:</span>
        {Array.from({ length: round.pegs }, (_, k) => k + 1).map((d) => <button key={d} className="btn" onClick={() => place(d)} disabled={busy} aria-label={`Put ${w} on peg ${d}`}>{d}</button>)}
        <button className="btn ghost" onClick={undo} disabled={busy || !right.length} aria-label="Take the last block off">↩️</button>
      </div>
    </>
  )
}
