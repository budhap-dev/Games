import { useEffect, useMemo, useState } from 'react'
import type { GameProps } from '@/games/types'
import { keyboardState, score } from './logic'
import type { Mark } from './logic'
import { WORDS } from './words'
import { sfx } from '@/shared/audio'

const CONFIG = { easy: { tries: 8, hint: true }, normal: { tries: 6, hint: false }, hard: { tries: 5, hint: false } }
const KEYS = ['qwertyuiop', 'asdfghjkl', '⏎zxcvbnm⌫']

export default function WordGuessGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const answer = useMemo(() => WORDS[Math.floor(Math.random() * WORDS.length)], [])
  const [rows, setRows] = useState<{ guess: string; marks: Mark[] }[]>([])
  const [cur, setCur] = useState(cfg.hint ? answer[0] : '')
  const [shake, setShake] = useState(false)
  const [done, setDone] = useState(false)
  const kb = keyboardState(rows)

  const submit = () => {
    if (cur.length !== 5) { setShake(true); sfx.bad(); setTimeout(() => setShake(false), 320); return }
    const marks = score(cur, answer)
    const next = [...rows, { guess: cur, marks }]
    setRows(next); setCur(cfg.hint ? answer[0] : '')
    if (cur === answer) {
      setDone(true); sfx.win()
      const pts = (cfg.tries - next.length + 1) * 10
      onScore(pts)
      setTimeout(() => onEnd({ score: pts, won: true, message: next.length === 1 ? 'First try?! Legendary.' : `Got it in ${next.length}!`, emoji: '🔤' }), 700)
    } else if (next.length >= cfg.tries) {
      setDone(true); sfx.lose()
      setTimeout(() => onEnd({ score: 0, won: false, message: `The word was ${answer.toUpperCase()}`, emoji: '📖' }), 700)
    } else sfx.flip()
  }
  const type = (k: string) => {
    if (paused || done) return
    if (k === '⏎') return submit()
    if (k === '⌫') { sfx.tap(); setCur((c) => (cfg.hint && c.length <= 1 ? c : c.slice(0, -1))); return }
    if (cur.length < 5) { sfx.tap(); setCur((c) => c + k) }
  }
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return
      if (e.key === 'Enter') type('⏎'); else if (e.key === 'Backspace') type('⌫'); else if (/^[a-zA-Z]$/.test(e.key)) type(e.key.toLowerCase())
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, rows, paused, done])

  const rowsToShow = Array.from({ length: cfg.tries }, (_, i) => rows[i] ?? (i === rows.length ? { guess: cur, marks: null } : { guess: '', marks: null }))
  return (
    <>
      <div className="turn">🔤 Guess {Math.min(rows.length + 1, cfg.tries)} / {cfg.tries}{cfg.hint ? ' · first letter given' : ''}</div>
      <div className="wg-rows" role="grid" aria-label="Guesses">
        {rowsToShow.map((r, i) => (
          <div key={i} className={`wg-row ${i === rows.length && shake ? 'shake' : ''}`}>
            {Array.from({ length: 5 }, (_, j) => (
              <div key={j} className={`c ${r.marks ? r.marks[j] : ''} ${i === rows.length && j === r.guess.length ? 'cur' : ''}`}>{r.guess[j] ?? ''}</div>
            ))}
          </div>
        ))}
      </div>
      <div className="kbd" aria-label="Keyboard">
        {KEYS.map((row) => (
          <div key={row} className="r">
            {row.split('').map((k) => (
              <button key={k} className={`${k === '⏎' || k === '⌫' ? 'wide' : ''} ${kb[k] ?? ''}`} onClick={() => type(k)} aria-label={k === '⏎' ? 'Enter' : k === '⌫' ? 'Delete' : k}>{k === '⏎' ? 'enter' : k}</button>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
