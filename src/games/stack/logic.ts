/** A block's left edge and width, as fractions of the board width. */
export interface Block { x: number; w: number }

/** Slide the moving block, bouncing between the board edges. Returns the new x and direction. */
export function slide(x: number, w: number, dir: 1 | -1, speed: number, dt: number): { x: number; dir: 1 | -1 } {
  let nx = x + dir * speed * dt
  if (nx < 0) return { x: -nx, dir: 1 }
  if (nx + w > 1) { nx = 2 * (1 - w) - nx; return { x: nx, dir: -1 } }
  return { x: nx, dir }
}

/**
 * Drop `moving` onto `top`. Within `tol` of a perfect line-up the block snaps and keeps its width;
 * otherwise the overhang is cut off (and returned so it can fall). No overlap → `placed` is null.
 */
export function drop(moving: Block, top: Block, tol: number): { placed: Block | null; cut: Block | null; perfect: boolean } {
  if (Math.abs(moving.x - top.x) <= tol) return { placed: { x: top.x, w: top.w }, cut: null, perfect: true }
  const l = Math.max(moving.x, top.x), r = Math.min(moving.x + moving.w, top.x + top.w)
  if (r <= l) return { placed: null, cut: moving, perfect: false }
  const cut = moving.x < top.x ? { x: moving.x, w: top.x - moving.x } : { x: r, w: moving.x + moving.w - r }
  return { placed: { x: l, w: r - l }, cut, perfect: false }
}
