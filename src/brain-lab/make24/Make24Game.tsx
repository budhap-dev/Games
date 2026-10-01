import { useRef, useState } from 'react'
import type { GameProps, GameStep } from '@/games/types'
import { OPS, apply, join, makePuzzle, num, solution } from './logic'
import type { Expr, Op } from './logic'
import { sfx } from '@/shared/audio'

const MAX = { easy: 6, normal: 9, hard: 13 }
const ROUNDS = 5
const fmt = (v: number) => (Number.isInteger(v) ? String(v) : (Math.round(v * 100) / 100).toString())

export default function Make24Game({ difficulty, paused, onScore, onEnd }: GameProps) {
  const [round, setRound] = useState(1)
  const [puzzle, setPuzzle] = useState(() => makePuzzle(MAX[difficulty]))
  const [nums, setNums] = useState<(number | null)[]>(puzzle)
  const [ex, setEx] = useState<(Expr | null)[]>(() => puzzle.map(num))
  const [hist, setHist] = useState<{ n: (number | null)[]; e: (Expr | null)[] }[]>([])
  const [a, setA] = useState<number | null>(null)
  const [op, setOp] = useState<Op | null>(null)
  const [solved, setSolved] = useState(0)
  const [flash, setFlash] = useState<string | null>(null)
  const log = useRef<GameStep[]>([])

  const reset = (p: number[]) => { setPuzzle(p); setNums(p); setEx(p.map(num)); setHist([]); setA(null); setOp(null) }
  const next = (s: number) => {
    if (round >= ROUNDS) onEnd({ score: s, won: s >= 3, message: s === ROUNDS ? 'All five — maths wizard!' : `${s} out of ${ROUNDS} solved`, emoji: s >= 3 ? '🎯' : '🧮', steps: log.current, stepsTitle: 'Your puzzles' })
    else { setRound(round + 1); reset(makePuzzle(MAX[difficulty])) }
  }
  const pick = (i: number) => {
    if (paused || nums[i] === null) return
    sfx.tap()
    if (a === null) { setA(i); return }
    if (a === i) { setA(null); return }
    if (op === null) { setA(i); return }
    const v = apply(nums[a]!, op, nums[i]!)
    if (v === null) { sfx.bad(); return }
    const n = nums.slice(); n[a] = null; n[i] = v
    const e = ex.slice(); e[a] = null; e[i] = join(ex[a]!, op, ex[i]!)
    setHist([...hist, { n: nums, e: ex }]); setNums(n); setEx(e); setA(i); setOp(null)
    if (n.filter((x) => x !== null).length === 1) {
      if (Math.abs(v - 24) < 1e-6) { sfx.win(); log.current = [...log.current, { move: puzzle.join(', '), result: e[i]!.s, ok: true }]; const s = solved + 1; setSolved(s); onScore(s); setFlash('✅ 24!'); setTimeout(() => { setFlash(null); next(s) }, 900) }
      else { sfx.bad(); setFlash(`${fmt(v)} — not 24, try again`); setTimeout(() => { setFlash(null); reset(puzzle) }, 1100) }
    }
  }
  const undo = () => { if (!hist.length) return; sfx.tap(); const h = hist[hist.length - 1]; setNums(h.n); setEx(h.e); setHist(hist.slice(0, -1)); setA(null); setOp(null) }
  const skip = () => { if (flash?.startsWith('✅')) return; sfx.tap(); log.current = [...log.current, { move: puzzle.join(', '), result: `skipped · ${solution(puzzle)}`, ok: false }]; next(solved) }

  return (
    <>
      <div className="turn">🎯 Puzzle {round} / {ROUNDS} · ✅ {solved}</div>
      <div className="m24">
        {nums.map((v, i) => <button key={i} className={`${a === i ? 'sel' : ''} ${v === null ? 'gone' : ''}`} onClick={() => pick(i)} aria-label={v === null ? '' : `Number ${fmt(v)}`}>{v === null ? '' : fmt(v)}</button>)}
      </div>
      <div className="ops" aria-label="Operators">
        {OPS.map((o) => <button key={o} className={op === o ? 'sel' : ''} onClick={() => { if (a === null) { sfx.bad(); return } sfx.tap(); setOp(o) }} aria-label={o}>{o}</button>)}
      </div>
      <div className="row">
        <button className="btn" onClick={undo} disabled={!hist.length}>↩ Undo</button>
        <button className="btn" onClick={() => reset(puzzle)}>🔄 Reset</button>
        <button className="btn ghost" onClick={skip}>Skip →</button>
      </div>
      {flash && <div className="howto center" style={{ background: flash.startsWith('✅') ? 'var(--lime-soft)' : 'var(--pink-soft)' }}>{flash}</div>}
    </>
  )
}
