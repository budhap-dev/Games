import { useMemo, useState } from 'react'
import type { GameProps } from '@/games/types'
import { feedback, makeCode } from './logic'
import { sfx } from '@/shared/audio'

const COLORS = ['#ff5fa2', '#2d9cdb', '#ffc93c', '#3fb55b', '#7b4fd6', '#ff7a1a']
const CONFIG = { easy: { colours: 4, tries: 12, repeats: false }, normal: { colours: 6, tries: 10, repeats: false }, hard: { colours: 6, tries: 8, repeats: true } }
const PEGS = 4

export default function CodeBreakerGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const code = useMemo(() => makeCode(cfg.colours, PEGS, cfg.repeats), [cfg])
  const [rows, setRows] = useState<{ guess: number[]; fb: { black: number; white: number } }[]>([])
  const [cur, setCur] = useState<(number | null)[]>(Array(PEGS).fill(null))
  const [sel, setSel] = useState(0)
  const [done, setDone] = useState(false)

  const place = (c: number) => {
    if (paused || done) return
    sfx.tap()
    const n = cur.slice(); n[sel] = c; setCur(n)
    const nextEmpty = n.findIndex((v, i) => v === null && i > sel)
    setSel(nextEmpty >= 0 ? nextEmpty : (n.indexOf(null) >= 0 ? n.indexOf(null) : Math.min(sel + 1, PEGS - 1)))
  }
  const submit = () => {
    if (paused || done || cur.some((v) => v === null)) { sfx.bad(); return }
    const guess = cur as number[]
    const fb = feedback(guess, code)
    const next = [...rows, { guess, fb }]
    setRows(next); setCur(Array(PEGS).fill(null)); setSel(0)
    if (fb.black === PEGS) {
      setDone(true); sfx.win()
      const pts = (cfg.tries - next.length + 1) * 10
      onScore(pts)
      setTimeout(() => onEnd({ score: pts, won: true, message: `Cracked in ${next.length}!`, emoji: '🕵️' }), 700)
    } else if (next.length >= cfg.tries) {
      setDone(true); sfx.lose()
      setTimeout(() => onEnd({ score: 0, won: false, message: 'Out of guesses — the code is revealed below', emoji: '🔒' }), 900)
    } else sfx.flip()
  }

  return (
    <>
      <div className="turn">🕵️ Guess {Math.min(rows.length + 1, cfg.tries)} / {cfg.tries}</div>
      {done && <div className="cb-row" aria-label="Secret code"><div className="cb-pegs">{code.map((c, i) => <span key={i} style={{ background: COLORS[c], borderColor: 'transparent' }} />)}</div><b>code</b></div>}
      <div className="cb-rows">
        {!done && (
          <div className="cb-row active" aria-label="Current guess">
            <div className="cb-pegs">
              {cur.map((v, i) => <button key={i} className={sel === i ? 'sel' : ''} style={{ background: v === null ? undefined : COLORS[v] }} onClick={() => { sfx.tap(); setSel(i) }} aria-label={`Peg ${i + 1}`} />)}
            </div>
            <button className="btn lime" onClick={submit} disabled={cur.some((v) => v === null)}>Check</button>
          </div>
        )}
        {rows.map((r, k) => (
          <div key={k} className="cb-row">
            <div className="cb-pegs">{r.guess.map((c, i) => <span key={i} style={{ background: COLORS[c], borderColor: 'transparent' }} />)}</div>
            <div className="cb-fb" aria-label={`${r.fb.black} exact, ${r.fb.white} misplaced`}>
              {Array.from({ length: PEGS }, (_, i) => <i key={i} className={i < r.fb.black ? 'b' : i < r.fb.black + r.fb.white ? 'w' : 'e'}>{i < r.fb.black ? '⚫' : i < r.fb.black + r.fb.white ? '⚪' : ''}</i>)}
            </div>
          </div>
        ))}
      </div>
      <div className="cb-pal" aria-label="Colours">
        {COLORS.slice(0, cfg.colours).map((c, i) => <button key={i} style={{ background: c }} onClick={() => place(i)} aria-label={`Colour ${i + 1}`} />)}
      </div>
    </>
  )
}
