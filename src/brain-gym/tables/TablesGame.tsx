import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GameProps } from '@/games/types'
import { buildFacts, pickNext, record, statusFor, weakest } from './logic'
import type { Fact } from './logic'
import { useTablesStore } from './stats'
import { sfx } from '@/shared/audio'

const CONFIG = {
  easy: { tables: [2, 5, 10], secs: 90, division: false },
  normal: { tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], secs: 60, division: false },
  hard: { tables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], secs: 60, division: true },
}
const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const CHEERS = ['Rock on!', 'Nice!', 'Boom!', 'Encore!', 'On fire 🔥', 'Smashing it!']

export default function TablesGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const store = useTablesStore()
  const [tables, setTables] = useState<number[]>(store.tables?.length ? store.tables : cfg.tables)
  const [phase, setPhase] = useState<'setup' | 'play'>('setup')
  const facts = useMemo(() => buildFacts(tables, cfg.division), [tables, cfg.division])
  const [fact, setFact] = useState<Fact | null>(null)
  const [typed, setTyped] = useState('')
  const [left, setLeft] = useState(cfg.secs * 1000)
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null)
  const [streak, setStreak] = useState(0)
  const correct = useRef(0), asked = useRef(0), totalMs = useRef(0), qStart = useRef(0)
  const statsRef = useRef(store.stats)
  const ended = useRef(false)
  const lockRef = useRef(false)

  const next = useCallback((last: string | null) => {
    const f = pickNext(facts, statsRef.current, last)
    setFact(f); setTyped(''); qStart.current = performance.now(); lockRef.current = false
  }, [facts])

  const start = () => { if (!tables.length) return; store.setTables(tables); sfx.unlock(); sfx.tap(); setPhase('play'); next(null) }

  // timer
  useEffect(() => {
    if (phase !== 'play' || paused || ended.current) return
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 100)), 100)
    return () => clearInterval(t)
  }, [phase, paused])

  // finish
  useEffect(() => {
    if (phase !== 'play' || left > 0 || ended.current) return
    ended.current = true
    store.setStats(statsRef.current)
    const c = correct.current, n = asked.current
    const avg = c ? totalMs.current / c / 1000 : 99
    const st = statusFor(avg)
    const weak = weakest(statsRef.current, facts)
    setTimeout(() => onEnd({
      score: c, won: c >= 15,
      message: `${st.emoji} ${st.name}!`, emoji: '🎸',
      details: [
        `${c} correct out of ${n} · ${n ? Math.round((c / n) * 100) : 0}% accuracy`,
        c ? `${avg.toFixed(1)}s per answer` : 'No answers this time — try again!',
        weak.length ? `Practise: ${weak.map((w) => w.text).join(' · ')}` : '',
      ].filter(Boolean),
    }), 400)
  }, [left, phase, facts, onEnd, store])

  const answer = useCallback((value: string) => {
    if (!fact || lockRef.current || ended.current) return
    lockRef.current = true
    const ms = performance.now() - qStart.current
    const ok = Number(value) === fact.answer
    asked.current++
    statsRef.current = record(statsRef.current, fact.key, ok, ms)
    if (ok) {
      correct.current++; totalMs.current += ms; onScore(correct.current)
      const s = streak + 1; setStreak(s); sfx.pop()
      setFlash({ ok: true, text: s % 5 === 0 ? `${s} in a row! ${CHEERS[(s / 5) % CHEERS.length | 0]}` : '✓' })
      setTimeout(() => { setFlash(null); next(fact.key) }, 180)
    } else {
      setStreak(0); sfx.bad()
      setFlash({ ok: false, text: `${fact.text} = ${fact.answer}` })
      setTimeout(() => { setFlash(null); next(fact.key) }, 1100)
    }
  }, [fact, streak, next, onScore])

  const type = useCallback((d: string) => {
    if (!fact || paused || lockRef.current) return
    if (d === '⌫') { setTyped((t) => t.slice(0, -1)); return }
    if (d === '✓') { if (typed) answer(typed); return } // Enter key only
    const t = typed + d
    setTyped(t)
    if (t.length >= String(fact.answer).length) answer(t) // auto-submit as soon as enough digits are in
  }, [fact, paused, typed, answer])

  useEffect(() => {
    if (phase !== 'play') return
    const h = (e: KeyboardEvent) => { if (/^\d$/.test(e.key)) type(e.key); else if (e.key === 'Backspace') type('⌫'); else if (e.key === 'Enter') type('✓') }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [phase, type])

  if (phase === 'setup') {
    return (
      <div className="card stack" style={{ width: 'min(100%, 520px)' }}>
        <h2 className="center" style={{ fontSize: '1.6rem' }}>🎸 Pick your tables</h2>
        <div className="chips" role="group" aria-label="Tables">
          {ALL.map((t) => (
            <button key={t} className={`chip ${tables.includes(t) ? 'on' : ''}`} aria-pressed={tables.includes(t)} onClick={() => { sfx.tap(); setTables((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t].sort((a, b) => a - b))) }}>{t}×</button>
          ))}
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn ghost" onClick={() => setTables(cfg.tables)}>Suggested</button>
          <button className="btn ghost" onClick={() => setTables(ALL)}>All</button>
        </div>
        <p className="muted center" style={{ margin: 0 }}>{cfg.secs} seconds{cfg.division ? ' · × and ÷' : ''} · answers check automatically · weak facts come back more often</p>
        <button className="btn primary" onClick={start} disabled={!tables.length}>🤘 Rock!</button>
      </div>
    )
  }

  const pct = (left / (cfg.secs * 1000)) * 100
  return (
    <div className="tt-play">
      <div className="row" style={{ width: '100%', justifyContent: 'space-between' }}>
        <div className="turn">⏱ {Math.ceil(left / 1000)}s</div>
        <div className="turn">🔥 {streak}</div>
        <div className="turn">✅ {correct.current}</div>
      </div>
      <div className="timer-bar" style={{ width: '100%' }} aria-hidden="true"><div style={{ width: `${pct}%`, background: pct < 20 ? 'var(--pink)' : 'var(--lime)' }} /></div>
      <div className="card tt-q">
        <div className="sum" aria-live="polite">{fact?.text} = <span className={`tt-ans ${flash ? (flash.ok ? 'ok' : 'bad') : ''}`}>{typed || '?'}</span></div>
        <div className={`tt-flash ${flash ? (flash.ok ? 'ok' : 'bad') : ''}`}>{flash?.text ?? '·'}</div>
      </div>
      <div className="numpad tt-pad" aria-label="Number pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'].map((d) => (
          <button key={d} className={d === '⌫' ? 'del' : d === '0' ? 'zero' : ''} onPointerDown={(e) => { e.preventDefault(); type(d) }} aria-label={d === '⌫' ? 'Delete' : d}>{d}</button>
        ))}
      </div>
    </div>
  )
}
