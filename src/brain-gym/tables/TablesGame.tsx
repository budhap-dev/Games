import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { GameProps } from '@/games/types'
import { avgCorrectSec, buildFacts, perTable, pickNext, record, statusFor, summarise, weakest } from './logic'
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
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓']
const fmt = (sec: number | null) => (sec === null ? '–' : `${sec.toFixed(2)}s`)

/** Timer lives in its own component so the 10×/s tick never re-renders the keypad/question. */
const Timer = memo(function Timer({ totalMs, paused, onExpire }: { totalMs: number; paused: boolean; onExpire: () => void }) {
  const [left, setLeft] = useState(totalMs)
  const fired = useRef(false)
  const expire = useRef(onExpire); expire.current = onExpire
  useEffect(() => {
    if (paused || fired.current) return
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 100)), 100)
    return () => clearInterval(t)
  }, [paused])
  useEffect(() => { if (left <= 0 && !fired.current) { fired.current = true; expire.current() } }, [left])
  const pct = (left / totalMs) * 100
  return (
    <>
      <div className="turn">⏱ {Math.ceil(left / 1000)}s</div>
      <div className="timer-bar" style={{ width: '100%', gridColumn: '1 / -1' }} aria-hidden="true"><div style={{ width: `${pct}%`, background: pct < 20 ? 'var(--pink)' : 'var(--lime)' }} /></div>
    </>
  )
})

/** Keypad is memoised; `onKey` is a stable ref-backed callback so the 12 buttons never re-render. */
const Keypad = memo(function Keypad({ onKey }: { onKey: (k: string) => void }) {
  return (
    <div className="numpad tt-pad" aria-label="Number pad">
      {KEYS.map((d) => (
        <button key={d} className={d === '⌫' ? 'del' : d === '✓' ? 'enter' : ''} onPointerDown={(e) => { e.preventDefault(); onKey(d) }} aria-label={d === '⌫' ? 'Delete' : d === '✓' ? 'Enter' : d}>{d === '⌫' ? 'DELETE' : d === '✓' ? 'ENTER' : d}</button>
      ))}
    </div>
  )
})

export default function TablesGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const store = useTablesStore()
  const [params] = useSearchParams()
  const fromUrl = (params.get('tables') ?? '').split(',').map(Number).filter((n) => n >= 1 && n <= 12)
  const [tables, setTables] = useState<number[]>(fromUrl.length ? fromUrl : store.tables?.length ? store.tables : cfg.tables)
  const [phase, setPhase] = useState<'setup' | 'play'>('setup')
  const [copied, setCopied] = useState(false)
  const facts = useMemo(() => buildFacts(tables, cfg.division), [tables, cfg.division])
  const [fact, setFact] = useState<Fact | null>(null)
  const [upNext, setUpNext] = useState<Fact | null>(null)
  const [typed, setTyped] = useState('')
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null)
  const [streak, setStreak] = useState(0)
  const [correctN, setCorrectN] = useState(0)
  // mutable session state (no re-renders)
  const st = useRef({ fact: null as Fact | null, upNext: null as Fact | null, typed: '', correct: 0, asked: 0, okMs: 0, qStart: 0, streak: 0, lock: false, ended: false,
    log: [] as { key: string; text: string; answer: number; ok: boolean; ms: number }[], stats: store.stats })
  const pausedRef = useRef(paused); pausedRef.current = paused

  const next = useCallback((last: string | null) => {
    const S = st.current
    const f = S.upNext && S.upNext.key !== last ? S.upNext : pickNext(facts, S.stats, last)
    const n = pickNext(facts, S.stats, f.key)
    S.fact = f; S.upNext = n; S.typed = ''; S.qStart = performance.now(); S.lock = false
    setFact(f); setUpNext(n); setTyped('')
  }, [facts])

  const finish = useCallback(() => {
    const S = st.current
    if (S.ended) return
    S.ended = true
    store.setStats(S.stats)
    const c = S.correct, n = S.asked
    const avg = c ? S.okMs / c / 1000 : 99
    const status = statusFor(avg)
    const weak = weakest(S.stats, facts)
    const all = summarise(S.stats)
    // session per-table
    const byTable = new Map<number, { ok: number; n: number; ms: number }>()
    for (const l of S.log) { const t = l.key.includes('x') ? Number(l.key.split('x')[0]) : Number(l.key.split('/')[1]); const e = byTable.get(t) ?? { ok: 0, n: 0, ms: 0 }; e.n++; if (l.ok) { e.ok++; e.ms += l.ms } byTable.set(t, e) }
    const tableLine = [...byTable.entries()].sort((a, b) => a[0] - b[0]).map(([t, e]) => `${t}× ${e.ok}/${e.n}${e.ok ? ` · ${(e.ms / e.ok / 1000).toFixed(2)}s` : ''}`).join('  ')
    setTimeout(() => onEnd({
      score: c, won: c >= 15,
      message: `${status.emoji} ${status.name}!`, emoji: '🎸',
      details: [
        `${c} correct out of ${n} · ${n ? Math.round((c / n) * 100) : 0}% accuracy`,
        c ? `Average ${avg.toFixed(2)}s per correct answer this session` : 'No answers this time — try again!',
        all.correct ? `All time: ${all.correct}/${all.answered} correct · average ${fmt(all.avgOkSec)} per correct answer` : '',
        tableLine ? `By table: ${tableLine}` : '',
        weak.length ? `Practise: ${weak.map((w) => w.text).join(' · ')}` : '',
      ].filter(Boolean),
      list: S.log.map((l) => ({ label: `${l.text} = ${l.answer}`, value: l.ok ? `${(l.ms / 1000).toFixed(2)}s · avg ${fmt(avgCorrectSec(S.stats[l.key]))}` : '✗', ok: l.ok })),
    }), 350)
  }, [facts, onEnd, store])

  const answer = useCallback((value: string) => {
    const S = st.current
    if (!S.fact || S.lock || S.ended) return
    S.lock = true
    const ms = performance.now() - S.qStart
    const ok = Number(value) === S.fact.answer
    S.asked++
    S.log.push({ key: S.fact.key, text: S.fact.text, answer: S.fact.answer, ok, ms })
    S.stats = record(S.stats, S.fact.key, ok, ms)
    if (ok) {
      S.correct++; S.okMs += ms; S.streak++
      setCorrectN(S.correct); setStreak(S.streak); onScore(S.correct); sfx.pop()
      setFlash({ ok: true, text: S.streak % 5 === 0 ? `${S.streak} in a row! ${CHEERS[(S.streak / 5) % CHEERS.length | 0]}` : '✓' })
      next(S.fact.key) // instantly on to the next question
      setTimeout(() => setFlash((f) => (f?.ok ? null : f)), 500)
    } else {
      S.streak = 0; setStreak(0); sfx.bad()
      setFlash({ ok: false, text: `${S.fact.text} = ${S.fact.answer}` })
      setTimeout(() => { setFlash(null); next(st.current.fact?.key ?? null) }, 900)
    }
  }, [next, onScore])

  const onKey = useCallback((d: string) => {
    const S = st.current
    if (!S.fact || pausedRef.current || S.lock || S.ended) return
    if (d === '⌫') { S.typed = S.typed.slice(0, -1); setTyped(S.typed); return }
    if (d === '✓') { if (S.typed) answer(S.typed); else sfx.bad(); return }
    if (S.typed.length < 3) { S.typed += d; setTyped(S.typed) }
  }, [answer])
  const onKeyRef = useRef(onKey); onKeyRef.current = onKey
  const stableKey = useCallback((d: string) => onKeyRef.current(d), [])

  useEffect(() => {
    if (phase !== 'play') return
    const h = (e: KeyboardEvent) => { if (/^\d$/.test(e.key)) onKeyRef.current(e.key); else if (e.key === 'Backspace') onKeyRef.current('⌫'); else if (e.key === 'Enter') onKeyRef.current('✓') }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [phase])

  const start = () => { if (!tables.length) return; store.setTables(tables); sfx.unlock(); sfx.tap(); setPhase('play'); next(null) }

  if (phase === 'setup') {
    const all = summarise(store.stats)
    const pt = perTable(store.stats, ALL)
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
        <p className="muted center" style={{ margin: 0 }}>{cfg.secs} seconds{cfg.division ? ' · × and ÷' : ''} · type the answer and press ENTER · weak facts come back more often</p>
        <button className="btn primary" onClick={start} disabled={!tables.length}>🤘 Rock!</button>
        <button className="btn ghost" onClick={async () => { const url = `${location.origin}/play/tables?d=${difficulty}&tables=${tables.join(',')}`; sfx.tap(); try { if (navigator.share && navigator.maxTouchPoints > 0) { await navigator.share({ title: 'PlayPatch — Table Rockstars', url }); return } } catch (e) { if ((e as Error).name === 'AbortError') return } try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard blocked */ } }}>{copied ? '✅ Link copied!' : '🔗 Share link with these tables'}</button>
        {all.answered > 0 && (
          <div className="tt-stats" aria-label="Your stats">
            <div className="row" style={{ justifyContent: 'space-between' }}><b>📊 All time</b><span>{all.correct}/{all.answered} correct · avg {fmt(all.avgOkSec)} per correct</span></div>
            <ul className="end-list" style={{ maxHeight: '22vh' }}>
              {pt.map(({ table, summary }) => <li key={table}><span>{table}× · {summary.correct}/{summary.answered}</span><b>{fmt(summary.avgOkSec)}</b></li>)}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="tt-play">
      <div className="tt-hud">
        <Timer totalMs={cfg.secs * 1000} paused={paused} onExpire={finish} />
        <div className="turn">🔥 {streak}</div>
        <div className="turn">✅ {correctN}</div>
      </div>
      <div className="tt-next" aria-label="Up next">Up next: <b>{upNext?.text}</b></div>
      <div className="card tt-q">
        <div className="sum" aria-live="polite">{fact?.text} = <span className={`tt-ans ${flash && !flash.ok ? 'bad' : ''}`}>{typed || '?'}</span></div>
        <div className={`tt-flash ${flash ? (flash.ok ? 'ok' : 'bad') : ''}`}>{flash?.text ?? '·'}</div>
      </div>
      <Keypad onKey={stableKey} />
    </div>
  )
}
