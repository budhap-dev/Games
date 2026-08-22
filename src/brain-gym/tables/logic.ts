export interface Fact { key: string; a: number; b: number; op: '×' | '÷'; answer: number; text: string }
export interface FactStat { seen: number; correct: number; avgMs: number; okMs?: number /* total ms spent on correct answers */ }
export type Stats = Record<string, FactStat>

/** Build the question pool for the chosen tables (a × b and optionally the inverse divisions). */
export function buildFacts(tables: number[], division: boolean): Fact[] {
  const out: Fact[] = []
  for (const t of tables) for (let b = 1; b <= 12; b++) {
    out.push({ key: `${t}x${b}`, a: t, b, op: '×', answer: t * b, text: `${t} × ${b}` })
    if (division) out.push({ key: `${t * b}/${t}`, a: t * b, b: t, op: '÷', answer: b, text: `${t * b} ÷ ${t}` })
  }
  return out
}

/** Weight: unseen facts get a boost, low accuracy and slow facts get more weight. */
export function weight(s: FactStat | undefined): number {
  if (!s || !s.seen) return 2.5
  const acc = s.correct / s.seen
  const slow = Math.min(1, Math.max(0, (s.avgMs - 2000) / 6000))
  return 0.6 + 3 * (1 - acc) + 1.5 * slow
}

/** Weighted random pick that never repeats the previous fact. */
export function pickNext(facts: Fact[], stats: Stats, lastKey: string | null, rnd: () => number = Math.random): Fact {
  const cands = facts.length > 1 ? facts.filter((f) => f.key !== lastKey) : facts
  const ws = cands.map((f) => weight(stats[f.key]))
  let r = rnd() * ws.reduce((a, b) => a + b, 0)
  for (let i = 0; i < cands.length; i++) { r -= ws[i]; if (r <= 0) return cands[i] }
  return cands[cands.length - 1]
}

export function record(stats: Stats, key: string, correct: boolean, ms: number): Stats {
  const s = stats[key] ?? { seen: 0, correct: 0, avgMs: 0 }
  const seen = s.seen + 1
  return { ...stats, [key]: { seen, correct: s.correct + (correct ? 1 : 0), avgMs: s.avgMs + (ms - s.avgMs) / seen, okMs: (s.okMs ?? 0) + (correct ? ms : 0) } }
}

/** Rock status from average seconds per correct answer (lower is better). */
export const STATUSES: { max: number; name: string; emoji: string }[] = [
  { max: 1, name: 'Rock Hero', emoji: '🤘' },
  { max: 1.5, name: 'Rock Legend', emoji: '🏆' },
  { max: 2, name: 'Arena Rocker', emoji: '🎆' },
  { max: 3, name: 'Headliner', emoji: '🎤' },
  { max: 4, name: 'Chart Topper', emoji: '📀' },
  { max: 5, name: 'Indie Star', emoji: '⭐' },
  { max: 6, name: 'Opening Act', emoji: '🎟️' },
  { max: 8, name: 'Busker', emoji: '🎸' },
  { max: 10, name: 'Garage Band', emoji: '🥁' },
  { max: Infinity, name: 'Roadie', emoji: '🎒' },
]
export const statusFor = (avgSec: number) => STATUSES.find((s) => avgSec <= s.max)!

/** Worst facts to practise: lowest accuracy, then slowest; only ones seen at least once. */
export function weakest(stats: Stats, facts: Fact[], n = 3): Fact[] {
  return facts
    .filter((f) => stats[f.key]?.seen)
    .map((f) => ({ f, s: stats[f.key] }))
    .sort((x, y) => (x.s.correct / x.s.seen - y.s.correct / y.s.seen) || (y.s.avgMs - x.s.avgMs))
    .slice(0, n)
    .map((x) => x.f)
}

/** Average seconds per correct answer for one fact (all time), or null if never answered correctly. */
export const avgCorrectSec = (s: FactStat | undefined) => (s && s.correct ? (s.okMs ?? s.avgMs * s.correct) / s.correct / 1000 : null)

export interface Summary { answered: number; correct: number; avgOkSec: number | null }
export function summarise(stats: Stats, keys?: string[]): Summary {
  let answered = 0, correct = 0, okMs = 0
  for (const [k, s] of Object.entries(stats)) {
    if (keys && !keys.includes(k)) continue
    answered += s.seen; correct += s.correct; okMs += s.okMs ?? s.avgMs * s.correct
  }
  return { answered, correct, avgOkSec: correct ? okMs / correct / 1000 : null }
}
/** Per-table summary (× facts a×b for table a, ÷ facts for divisor a). */
export function perTable(stats: Stats, tables: number[]): { table: number; summary: Summary }[] {
  return tables.map((t) => {
    const keys = Object.keys(stats).filter((k) => k.startsWith(`${t}x`) || k.endsWith(`/${t}`))
    return { table: t, summary: summarise(stats, keys) }
  }).filter((x) => x.summary.answered > 0)
}
