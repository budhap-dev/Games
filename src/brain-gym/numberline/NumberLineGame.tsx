import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { GameProps, GameStep } from '@/games/types'
import { grade, makeRound, valueAt } from './logic'
import { sfx } from '@/shared/audio'

const ROUNDS = 10
const X0 = 30, X1 = 370, Y = 110

export default function NumberLineGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const [round, setRound] = useState(() => makeRound(difficulty))
  const [n, setN] = useState(1)
  const [guess, setGuess] = useState<number | null>(null)
  const [total, setTotal] = useState(0)
  const [hist, setHist] = useState<GameStep[]>([])
  const svg = useRef<SVGSVGElement>(null)
  const xOf = (v: number) => X0 + ((v - round.min) / (round.max - round.min)) * (X1 - X0)
  const got = guess === null ? null : grade(round, guess)

  const tap = (e: PointerEvent) => {
    if (paused || guess !== null || !svg.current) return
    const box = svg.current.getBoundingClientRect()
    const vx = ((e.clientX - box.left) / box.width) * 400
    const g = valueAt(round, (vx - X0) / (X1 - X0))
    const s = grade(round, g), t = total + s
    const you = round.max > 2 ? Math.round(g) : +g.toFixed(2)
    const h = [...hist, { move: `Where is ${round.label}?`, result: `you ${you} · ${s ? '⭐'.repeat(s) : `it's ${round.label}`}`, ok: s === 3 ? true : s === 0 ? false : undefined }]
    setGuess(g); setTotal(t); onScore(t); setHist(h)
    s === 3 ? sfx.good() : s > 0 ? sfx.pop() : sfx.bad()
    setTimeout(() => {
      if (n >= ROUNDS) {
        const max = ROUNDS * 3
        onEnd({ score: t, won: t >= 20, message: t >= 27 ? 'Bullseye frog! Amazing!' : t >= 20 ? `Great jumping! ${t} of ${max} stars` : `${t} of ${max} stars — keep hopping!`, emoji: '🐸', steps: h, stepsTitle: 'Your jumps' })
        return
      }
      setN(n + 1); setRound(makeRound(difficulty)); setGuess(null)
    }, 1500)
  }

  const ticks: number[] = []
  for (let v = round.min; v <= round.max + 1e-9; v += round.tick) ticks.push(+v.toFixed(4))
  const frogX = guess === null ? xOf(round.min) : xOf(guess)
  return (
    <>
      <div className="turn">Jump {n} / {ROUNDS} · ⭐ {total}</div>
      <p className="nl-ask">Where is <b>{round.label}</b>?</p>
      <svg ref={svg} className="numline" viewBox="0 0 400 160" onPointerDown={tap} role="img" aria-label={`Number line from ${round.min} to ${round.max}. Tap where ${round.label} goes.`}>
        <rect className="nl-hit" x={0} y={0} width={400} height={160} />
        <line className="nl-axis" x1={X0} x2={X1} y1={Y} y2={Y} />
        {ticks.map((v) => <line key={v} className="nl-tick" x1={xOf(v)} x2={xOf(v)} y1={Y - (round.labels.includes(v) ? 14 : 9)} y2={Y + (round.labels.includes(v) ? 14 : 9)} />)}
        {round.labels.map((v) => <text key={v} className="nl-label" x={xOf(v)} y={Y + 40}>{v}</text>)}
        {guess !== null && <text className="nl-flag" x={xOf(round.target)} y={Y - 12}>🚩</text>}
        <text className="nl-frog" x={0} y={Y - 14} style={{ transform: `translateX(${frogX}px)` }}>🐸</text>
      </svg>
      <div className="howto gym-tip center" aria-live="polite" style={{ visibility: guess === null ? 'hidden' : 'visible' }}>
        {got === 3 ? '⭐⭐⭐ Spot on!' : got === 2 ? '⭐⭐ So close!' : got === 1 ? '⭐ Nearly — the 🚩 shows where it goes' : '💡 The 🚩 shows where it goes'}
      </div>
    </>
  )
}
