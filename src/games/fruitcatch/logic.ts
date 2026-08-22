export type Kind = 'fruit' | 'boot'
export interface Item { x: number; y: number; kind: Kind; emoji: string; vy: number }
export const FRUIT = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍒', '🍑', '🥝', '🍍']

export function spawn(bootChance: number, speed: number, rnd: () => number = Math.random): Item {
  const boot = rnd() < bootChance
  return { x: 0.08 + rnd() * 0.84, y: -0.05, kind: boot ? 'boot' : 'fruit', emoji: boot ? '🥾' : FRUIT[Math.floor(rnd() * FRUIT.length)], vy: speed * (0.8 + rnd() * 0.5) }
}

/** Advance items; returns items caught by the basket and items that fell off the bottom. */
export function stepItems(items: Item[], basketX: number, basketW: number, dt: number): { caught: Item[]; missed: Item[]; remaining: Item[] } {
  const caught: Item[] = [], missed: Item[] = [], remaining: Item[] = []
  for (const it of items) {
    it.y += it.vy * dt
    const inBasket = it.y >= 0.86 && it.y <= 0.93 && Math.abs(it.x - basketX) < basketW / 2 + 0.03
    if (inBasket) caught.push(it)
    else if (it.y > 1.05) missed.push(it)
    else remaining.push(it)
  }
  return { caught, missed, remaining }
}
