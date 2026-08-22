export interface Pipe { x: number; gapY: number; passed: boolean }
export interface Bee { y: number; vy: number }
export const BEE_X = 0.28, BEE_R = 0.035, PIPE_W = 0.14

export function stepBee(bee: Bee, gravity: number, dt: number) {
  bee.vy += gravity * dt
  bee.y += bee.vy * dt
}
export const flap = (bee: Bee, power: number) => { bee.vy = -power }

/** True if the bee overlaps a pipe's top/bottom flower or the ground/ceiling. */
export function collides(bee: Bee, pipes: Pipe[], gap: number): boolean {
  if (bee.y - BEE_R < 0 || bee.y + BEE_R > 0.95) return true
  for (const p of pipes) {
    const inX = BEE_X + BEE_R > p.x && BEE_X - BEE_R < p.x + PIPE_W
    if (!inX) continue
    if (bee.y - BEE_R < p.gapY - gap / 2 || bee.y + BEE_R > p.gapY + gap / 2) return true
  }
  return false
}
export function spawnPipe(x: number, rnd: () => number = Math.random): Pipe {
  return { x, gapY: 0.25 + rnd() * 0.45, passed: false }
}
