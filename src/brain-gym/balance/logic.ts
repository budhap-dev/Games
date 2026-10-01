import { pick, randInt } from '@/shared/random'
import type { Difficulty } from '@/shared/store'

/** A block on the see-saw: distance from the middle (peg 1 is nearest) and weight. */
export interface Block { d: number; w: number }
export interface BalanceRound { pegs: number; left: Block[]; tray: number[]; best: number }

const CFG: Record<Difficulty, { pegs: number; left: number; leftW: number[]; tray: number[] }> = {
  easy: { pegs: 3, left: 1, leftW: [1, 2, 3], tray: [1, 2, 3] },
  normal: { pegs: 4, left: 2, leftW: [1, 2, 3], tray: [1, 2, 3] },
  hard: { pegs: 5, left: 3, leftW: [1, 2, 3, 4], tray: [2, 3] },
}

/** Turning force of one side: Σ weight × distance. The scale balances when both sides match. */
export const turning = (bs: Block[]) => bs.reduce((s, b) => s + b.w * b.d, 0)

/** Fewest tray blocks (any pegs 1..pegs) whose turning force adds up to `target`; Infinity if impossible. */
export function fewestBlocks(target: number, tray: number[], pegs: number): number {
  const vals = new Set<number>()
  for (const w of tray) for (let d = 1; d <= pegs; d++) vals.add(w * d)
  const best = Array<number>(target + 1).fill(Infinity)
  best[0] = 0
  for (let t = 1; t <= target; t++) for (const v of vals) if (v <= t) best[t] = Math.min(best[t], best[t - v] + 1)
  return best[target]
}

export function makeRound(d: Difficulty, rnd: () => number = Math.random): BalanceRound {
  const c = CFG[d]
  for (;;) {
    const left = Array.from({ length: c.left }, () => ({ d: 1 + randInt(c.pegs, rnd), w: pick(c.leftW, rnd) }))
    const best = fewestBlocks(turning(left), c.tray, c.pegs)
    if (best <= 3) return { pegs: c.pegs, left, tray: c.tray, best }
  }
}

/** 3 stars for the fewest blocks, 2 if close, else 1. */
export const stars = (used: number, best: number) => (used <= best ? 3 : used <= best + 2 ? 2 : 1)

/** Beam tilt in degrees (positive = right side down), capped so it never flips over. */
export const tilt = (left: number, right: number) => Math.max(-14, Math.min(14, (right - left) * 2))
