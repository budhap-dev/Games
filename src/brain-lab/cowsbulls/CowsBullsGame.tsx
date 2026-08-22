import { useEffect, useMemo, useState } from 'react'
import type { GameProps } from '@/games/types'
import { bullsCows, hasRepeats, makeSecret } from './logic'
import { sfx } from '@/shared/audio'

const CONFIG = { easy: { len: 3, tries: 10 }, normal: { len: 4, tries: 10 }, hard: { len: 5, tries: 9 } }

export default function CowsBullsGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const secret = useMemo(() => makeSecret(cfg.len), [cfg.len])
  const [cur, setCur] = useState('')
  const [log, setLog] = useState<{ g: string; bulls: number; cows: number }[]>([])
  const [done, setDone] = useState(false)
  const [shake, setShake] = useState(false)

  const submit = () => {
    if (paused || done) return
    if (cur.length !== cfg.len || hasRepeats(cur)) { sfx.bad(); setShake(true); setTimeout(() => setShake(false), 300); return }
    const r = bullsCows(cur, secret)
    const next = [...log, { g: cur, ...r }]
    setLog(next); setCur('')
    if (r.bulls === cfg.len) {
      setDone(true); sfx.win()
      const pts = (cfg.tries - next.length + 1) * 10; onScore(pts)
      setTimeout(() => onEnd({ score: pts, won: true, message: `Cracked ${secret} in ${next.length}!`, emoji: '🐮' }), 700)
    } else if (next.length >= cfg.tries) {
      setDone(true); sfx.lose()
      setTimeout(() => onEnd({ score: 0, won: false, message: `The number was ${secret}`, emoji: '🔒' }), 800)
    } else sfx.flip()
  }
  const type = (d: string) => { if (paused || done || cur.length >= cfg.len || cur.includes(d)) { if (cur.includes(d)) sfx.bad(); return } sfx.tap(); setCur(cur + d) }
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (/^\d$/.test(e.key)) type(e.key); else if (e.key === 'Backspace') setCur((c) => c.slice(0, -1)); else if (e.key === 'Enter') submit() }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, log, paused, done])

  return (
    <>
      <div className="turn">🐮 Guess {Math.min(log.length + 1, cfg.tries)} / {cfg.tries} · {cfg.len} digits</div>
      <div className={`cb-guess ${shake ? 'shake' : ''}`} aria-live="polite">{cur.padEnd(cfg.len, '_')}</div>
      <div className="numpad" aria-label="Number pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => <button key={d} onClick={() => type(d)} disabled={cur.includes(d)}>{d}</button>)}
        <button onClick={() => { sfx.tap(); setCur(cur.slice(0, -1)) }} aria-label="Delete">⌫</button>
        <button className="lime" style={{ gridColumn: 'span 4', background: 'var(--lime)', color: '#fff', borderColor: 'transparent' }} onClick={submit} aria-label="Guess">Guess ✓</button>
      </div>
      <div className="cows-log" aria-label="Previous guesses">
        {log.map((l, i) => <div key={i}><span>{l.g}</span><span>🐂 {l.bulls} · 🐄 {l.cows}</span></div>)}
      </div>
    </>
  )
}
