export type Op = '+' | '−' | '×' | '÷'
export const OPS: Op[] = ['+', '−', '×', '÷']
export const apply = (a: number, op: Op, b: number): number | null => op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : b === 0 ? null : a / b

/** An expression with the precedence of its top operator (3 = a plain number). */
export interface Expr { s: string; p: number }
const PREC: Record<Op, number> = { '+': 1, '−': 1, '×': 2, '÷': 2 }
export const num = (v: number): Expr => ({ s: String(v), p: 3 })
export function join(a: Expr, op: Op, b: Expr): Expr {
  const q = PREC[op]
  const l = a.p < q ? `(${a.s})` : a.s
  const r = b.p < q || (b.p === q && (op === '−' || op === '÷')) ? `(${b.s})` : b.s
  return { s: `${l}${op}${r}`, p: q }
}
/** One way to make 24 using each number exactly once, e.g. "(1+2+3)×4", or null. */
export function solution(nums: number[], ex: Expr[] = nums.map(num)): string | null {
  if (nums.length === 1) return Math.abs(nums[0] - 24) < 1e-6 ? ex[0].s : null
  for (let i = 0; i < nums.length; i++) for (let j = 0; j < nums.length; j++) {
    if (i === j) continue
    const keep = (_: unknown, k: number) => k !== i && k !== j
    for (const op of OPS) {
      const v = apply(nums[i], op, nums[j])
      if (v === null) continue
      const s = solution([...nums.filter(keep), v], [...ex.filter(keep), join(ex[i], op, ex[j])])
      if (s) return s
    }
  }
  return null
}
/** Can these numbers make 24 using each exactly once? */
export const solvable = (nums: number[]) => solution(nums) !== null
export function makePuzzle(maxN: number, rnd: () => number = Math.random): number[] {
  for (;;) {
    const nums = Array.from({ length: 4 }, () => 1 + Math.floor(rnd() * maxN))
    if (solvable(nums)) return nums
  }
}
