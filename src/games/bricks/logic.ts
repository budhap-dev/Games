export interface Brick { x: number; y: number; w: number; h: number; col: number; alive: boolean }
export interface Ball { x: number; y: number; vx: number; vy: number; r: number }
export interface Paddle { x: number; w: number; h: number; y: number }

/** Bricks laid out in unit space (0..1). */
export function createBricks(rows: number, cols: number): Brick[] {
  const gap = 0.012, top = 0.08, w = (1 - gap * (cols + 1)) / cols, h = 0.045
  const out: Brick[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push({ x: gap + c * (w + gap), y: top + r * (h + gap), w, h, col: r % 6, alive: true })
  return out
}

const hits = (b: Ball, r: { x: number; y: number; w: number; h: number }) =>
  b.x + b.r > r.x && b.x - b.r < r.x + r.w && b.y + b.r > r.y && b.y - b.r < r.y + r.h

/** Advance the ball one step. Returns bricks broken this step and whether the ball was lost. */
export function stepBall(ball: Ball, paddle: Paddle, bricks: Brick[]): { broke: number; lost: boolean; bounced: boolean } {
  ball.x += ball.vx; ball.y += ball.vy
  let bounced = false
  if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); bounced = true }
  if (ball.x + ball.r > 1) { ball.x = 1 - ball.r; ball.vx = -Math.abs(ball.vx); bounced = true }
  if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); bounced = true }
  // paddle
  if (ball.vy > 0 && hits(ball, paddle)) {
    ball.y = paddle.y - ball.r
    const rel = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2) // -1..1
    const speed = Math.hypot(ball.vx, ball.vy)
    const ang = rel * (Math.PI / 3) // up to 60°
    ball.vx = Math.sin(ang) * speed; ball.vy = -Math.cos(ang) * speed
    bounced = true
  }
  let broke = 0
  for (const br of bricks) {
    if (!br.alive || !hits(ball, br)) continue
    br.alive = false; broke++
    // reflect on the axis of least penetration
    const ox = Math.min(ball.x + ball.r - br.x, br.x + br.w - (ball.x - ball.r))
    const oy = Math.min(ball.y + ball.r - br.y, br.y + br.h - (ball.y - ball.r))
    if (ox < oy) ball.vx = -ball.vx; else ball.vy = -ball.vy
    break
  }
  return { broke, lost: ball.y - ball.r > 1.05, bounced }
}
