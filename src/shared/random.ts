export const randInt = (n: number, rnd: () => number = Math.random) => Math.floor(rnd() * n)
export const pick = <T,>(a: readonly T[], rnd: () => number = Math.random): T => a[randInt(a.length, rnd)]
export function shuffle<T>(a: readonly T[], rnd: () => number = Math.random): T[] {
  const r = a.slice()
  for (let i = r.length - 1; i > 0; i--) { const j = randInt(i + 1, rnd); [r[i], r[j]] = [r[j], r[i]] }
  return r
}
/** Small seeded PRNG (mulberry32) for deterministic tests. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
