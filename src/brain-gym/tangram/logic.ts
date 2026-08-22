/** Tangram pieces on a 4×4 unit square (y up). Each piece is a polygon; targets are translations of the piece. */
export type Pt = [number, number]
export interface Piece { id: string; pts: Pt[]; color: string }
export interface Figure { name: string; emoji: string; targets: Record<string, Pt>; w: number; h: number }

export const PIECES: Piece[] = [
  { id: 'big1', pts: [[0, 0], [4, 0], [2, 2]], color: '#ff7a1a' },
  { id: 'big2', pts: [[0, 0], [0, 4], [2, 2]], color: '#2d9cdb' },
  { id: 'med', pts: [[4, 4], [4, 2], [2, 4]], color: '#3fb55b' },
  { id: 'sq', pts: [[2, 2], [3, 3], [2, 4], [1, 3]], color: '#ffc93c' },
  { id: 's1', pts: [[0, 4], [2, 4], [1, 3]], color: '#ff5fa2' },
  { id: 's2', pts: [[2, 2], [3, 1], [3, 3]], color: '#7b4fd6' },
  { id: 'para', pts: [[3, 1], [4, 0], [4, 2], [3, 3]], color: '#2dbdb0' },
]
const zero = Object.fromEntries(PIECES.map((p) => [p.id, [0, 0] as Pt]))

export const FIGURES: Figure[] = [
  { name: 'Square', emoji: '🟧', w: 4, h: 4, targets: { ...zero } },
  // House: the bottom triangle becomes the roof (notch at the bottom = doorway)
  { name: 'House', emoji: '🏠', w: 4, h: 6, targets: { ...zero, big1: [0, 4] } },
  // Kite: both big triangles move to the outside -> a tilted rectangle (silhouette only on Hard)
  { name: 'Kite', emoji: '🪁', w: 6, h: 6, targets: { ...zero, big1: [0, 4], big2: [4, 0] } },
]

export const area = (pts: Pt[]) => Math.abs(pts.reduce((s, [x, y], i) => { const [nx, ny] = pts[(i + 1) % pts.length]; return s + x * ny - nx * y }, 0)) / 2

export function centroid(pts: Pt[]): Pt {
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]
}

/** Snap when the dragged offset is within `tol` of the target offset. */
export function snaps(offset: Pt, target: Pt, tol = 0.45): boolean {
  return Math.hypot(offset[0] - target[0], offset[1] - target[1]) <= tol
}
