export interface Ball { x: number; y: number; vx: number; vy: number }
/** Rim from x to x + w at height y (board fractions, y grows downward); backboard on the right. */
export interface Hoop { x: number; y: number; w: number }
export const BOARD_H = 0.16

export const stepBall = (b: Ball, g: number, wind: number, dt: number): Ball => {
  const vx = b.vx + wind * dt, vy = b.vy + g * dt
  return { x: b.x + vx * dt, y: b.y + vy * dt, vx, vy }
}

/** Predicted flight (for the dotted aiming guide). */
export function path(b: Ball, g: number, wind: number, dt: number, n: number): Ball[] {
  const out: Ball[] = []
  let cur = b
  for (let i = 0; i < n; i++) { cur = stepBall(cur, g, wind, dt); out.push(cur) }
  return out
}

/** Slingshot aim: pull back by (dx, dy) → launch velocity, capped at `max`. */
export function aimFromDrag(dx: number, dy: number, k: number, max: number): { vx: number; vy: number } {
  let vx = dx * k, vy = dy * k
  const s = Math.hypot(vx, vy)
  if (s > max) { vx *= max / s; vy *= max / s }
  return { vx, vy }
}

/** True when the ball drops down through the rim (not touching its edges). */
export function throughHoop(prev: Ball, b: Ball, h: Hoop, r: number): boolean {
  if (!(prev.y < h.y && b.y >= h.y)) return false
  const t = (h.y - prev.y) / (b.y - prev.y)
  const x = prev.x + t * (b.x - prev.x)
  return x > h.x + r * 0.6 && x < h.x + h.w - r * 0.6
}

/** Bounce off the backboard (a vertical line just right of the rim). */
export function bounceBoard(prev: Ball, b: Ball, h: Hoop, r: number): Ball {
  const bx = h.x + h.w + 0.01
  if (b.vx > 0 && prev.x + r <= bx && b.x + r > bx && b.y > h.y - BOARD_H && b.y < h.y + 0.02) {
    return { ...b, x: bx - r, vx: -b.vx * 0.55 }
  }
  return b
}

export const spawnHoop = (w: number, rnd: () => number = Math.random): Hoop =>
  ({ x: 0.5 + rnd() * (0.4 - w), y: 0.3 + rnd() * 0.4, w })

/** End-screen summary of a throw: launch angle, speed and (optionally) wind, e.g. "52° · power 1.6 · 💨 →3". */
export function describeThrow(vx: number, vy: number, wind?: number): string {
  const s = `${Math.round((Math.atan2(-vy, vx) * 180) / Math.PI)}° · power ${Math.hypot(vx, vy).toFixed(1)}`
  return wind === undefined ? s : `${s} · 💨 ${wind >= 0 ? '→' : '←'}${Math.round(Math.abs(wind) * 10)}`
}
