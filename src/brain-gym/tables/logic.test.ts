import { describe, it, expect } from 'vitest'
import { avgCorrectSec, buildFacts, perTable, pickNext, record, statusFor, summarise, weakest, weight } from './logic'
import { seeded } from '@/shared/random'

describe('table rockstars', () => {
  it('builds × facts (and ÷ inverses when asked)', () => {
    expect(buildFacts([7], false).length).toBe(12)
    const f = buildFacts([3], true)
    expect(f.length).toBe(24)
    expect(f.find((x) => x.key === '21/3')?.answer).toBe(7)
  })
  it('weights wrong/slow facts higher and never repeats the last one', () => {
    expect(weight({ seen: 4, correct: 1, avgMs: 7000 })).toBeGreaterThan(weight({ seen: 4, correct: 4, avgMs: 1200 }))
    const facts = buildFacts([2], false)
    const rnd = seeded(5)
    let last: string | null = null
    for (let i = 0; i < 50; i++) { const f = pickNext(facts, {}, last, rnd); expect(f.key).not.toBe(last); last = f.key }
  })
  it('records running accuracy/avg and ranks status by speed', () => {
    let s = record({}, '2x3', true, 1000); s = record(s, '2x3', false, 3000)
    expect(s['2x3']).toEqual({ seen: 2, correct: 1, avgMs: 2000, okMs: 1000 })
    expect(avgCorrectSec(s['2x3'])).toBe(1)
    expect(statusFor(0.9).name).toBe('Rock Hero'); expect(statusFor(7).name).toBe('Busker'); expect(statusFor(20).name).toBe('Roadie')
    const facts = buildFacts([2], false)
    s = record(s, '2x7', true, 500)
    expect(weakest(s, facts, 1)[0].key).toBe('2x3')
  })
})

describe('table rockstars stats', () => {
  it('summarises overall and per table using correct-answer time only', () => {
    let s = record({}, '7x8', true, 2000); s = record(s, '7x8', false, 5000); s = record(s, '56/7', true, 1000); s = record(s, '3x3', true, 500)
    const all = summarise(s)
    expect(all.answered).toBe(4); expect(all.correct).toBe(3); expect(all.avgOkSec).toBeCloseTo((2000 + 1000 + 500) / 3 / 1000)
    const pt = perTable(s, [7, 3, 9])
    expect(pt.map((x) => x.table)).toEqual([7, 3])
    expect(pt[0].summary.avgOkSec).toBeCloseTo(1.5)
  })
})
