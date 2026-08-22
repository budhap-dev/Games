import { useState } from 'react'
import type { GameProps } from '@/games/types'
import { canMove, move, optimal, solved, start } from './logic'
import { sfx } from '@/shared/audio'

const N = { easy: 3, normal: 4, hard: 6 }
const COLORS = ['#ff5fa2', '#ff7a1a', '#ffc93c', '#3fb55b', '#2d9cdb', '#7b4fd6', '#2dbdb0']

export default function HanoiGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const n = N[difficulty]
  const [pegs, setPegs] = useState(() => start(n))
  const [sel, setSel] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [done, setDone] = useState(false)

  const tap = (i: number) => {
    if (paused || done) return
    if (sel === null) { if (pegs[i].length) { sfx.tap(); setSel(i) } return }
    if (sel === i) { setSel(null); return }
    if (!canMove(pegs, sel, i)) { sfx.bad(); setSel(null); return }
    const p = move(pegs, sel, i); setPegs(p); setSel(null); sfx.flip()
    const m = moves + 1; setMoves(m)
    if (solved(p, n)) {
      setDone(true); sfx.win(); onScore(1)
      const opt = optimal(n)
      setTimeout(() => onEnd({ score: 1, won: true, message: m === opt ? `Perfect! ${m} moves — the minimum!` : `Solved in ${m} moves (best possible: ${opt})`, emoji: '🗼' }), 600)
    }
  }
  return (
    <>
      <div className="turn">🗼 {moves} moves · best possible {optimal(n)}</div>
      <div className="hanoi">
        {pegs.map((p, i) => (
          <button key={i} className={`peg ${sel === i ? 'sel' : ''}`} onClick={() => tap(i)} aria-label={`Peg ${i + 1}, ${p.length} discs`}>
            {p.map((d, k) => <div key={d} className={`disc ${sel === i && k === p.length - 1 ? 'lift' : ''}`} style={{ width: `${30 + (d / n) * 65}%`, background: COLORS[d % COLORS.length] }} />)}
          </button>
        ))}
      </div>
      <p className="muted center" style={{ margin: 0, fontSize: '.95rem' }}>Tap a peg to pick up its top disc, then tap where to put it</p>
    </>
  )
}
