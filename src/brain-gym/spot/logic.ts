import { pick, shuffle } from '@/shared/random'

export interface Item { id: number; x: number; y: number; emoji: string; size: number }
export type Change = { id: number; kind: 'swap' | 'remove' | 'size' }
export interface Scene { left: Item[]; right: Item[]; changes: Change[] }

const SKY = ['☁️', '🌞', '🐦', '🦋', '🎈', '🪁', '🌈']
const GROUND = ['🌳', '🌻', '🐝', '🐞', '🍄', '🐰', '🏠', '🐱', '🐶', '🌷', '🐢', '🦆', '🍎', '⛵']

/** Build a scene of ~12 emoji items on a 4x4 grid, then apply `n` differences to the right side. */
export function generateScene(n: number, rnd: () => number = Math.random): Scene {
  const slots: [number, number][] = []
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) slots.push([r, c])
  const chosen = shuffle(slots, rnd).slice(0, 12)
  const left: Item[] = chosen.map(([r, c], i) => {
    const pool = r < 2 ? SKY : GROUND
    return {
      id: i,
      x: 12.5 + c * 25 + (rnd() - 0.5) * 8,
      y: 12.5 + r * 25 + (rnd() - 0.5) * 8,
      emoji: pick(pool, rnd),
      size: 11 + rnd() * 3,
    }
  })
  const kinds: Change['kind'][] = ['swap', 'remove', 'size']
  const targets = shuffle(left, rnd).slice(0, n)
  const changes: Change[] = targets.map((t, i) => ({ id: t.id, kind: kinds[i % kinds.length] }))
  const right: Item[] = left.map((it) => {
    const ch = changes.find((c) => c.id === it.id)
    if (!ch) return it
    if (ch.kind === 'remove') return { ...it, emoji: '' }
    if (ch.kind === 'size') return { ...it, size: it.size * (it.size > 10.5 ? 0.6 : 1.6) }
    const pool = (SKY.includes(it.emoji) ? SKY : GROUND).filter((e) => e !== it.emoji && !left.some((o) => o.emoji === e))
    return { ...it, emoji: pick(pool.length ? pool : GROUND.filter((e) => e !== it.emoji), rnd) }
  })
  return { left, right, changes }
}

/** Which changed item (if any) is within `radius` % of the tap point. */
export function hitTest(scene: Scene, x: number, y: number, radius = 10): Change | null {
  let best: Change | null = null, bd = radius * radius
  for (const ch of scene.changes) {
    const it = scene.left.find((i) => i.id === ch.id)!
    const d = (it.x - x) ** 2 + (it.y - y) ** 2
    if (d < bd) { bd = d; best = ch }
  }
  return best
}
