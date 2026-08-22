export type Op = '+' | '−' | '×' | '÷'
export const OPS: Op[] = ['+', '−', '×', '÷']
export const apply = (a: number, op: Op, b: number): number | null => op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : b === 0 ? null : a / b

/** Can these numbers make 24 using each exactly once? */
export function solvable(nums: number[]): boolean {
  if (nums.length === 1) return Math.abs(nums[0] - 24) < 1e-6
  for (let i = 0; i < nums.length; i++) for (let j = 0; j < nums.length; j++) {
    if (i === j) continue
    const rest = nums.filter((_, k) => k !== i && k !== j)
    for (const op of OPS) {
      const v = apply(nums[i], op, nums[j])
      if (v === null) continue
      if (solvable([...rest, v])) return true
    }
  }
  return false
}
export function makePuzzle(maxN: number, rnd: () => number = Math.random): number[] {
  for (;;) {
    const nums = Array.from({ length: 4 }, () => 1 + Math.floor(rnd() * maxN))
    if (solvable(nums)) return nums
  }
}
