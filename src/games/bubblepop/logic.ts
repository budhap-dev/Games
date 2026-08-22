/** Hex-offset bubble grid. Row r is shifted right by half a cell when (r + shift) is odd. */
export type Grid = (number | null)[][] // grid[row][col] = colour index or null

export interface GridShape { cols: number; shift: number }

export function neighbors(r: number, c: number, s: GridShape): [number, number][] {
  const odd = (r + s.shift) % 2 === 1
  const n: [number, number][] = [[r, c - 1], [r, c + 1]]
  if (odd) n.push([r - 1, c], [r - 1, c + 1], [r + 1, c], [r + 1, c + 1])
  else n.push([r - 1, c - 1], [r - 1, c], [r + 1, c - 1], [r + 1, c])
  return n.filter(([rr, cc]) => rr >= 0 && cc >= 0 && cc < s.cols)
}

export const get = (g: Grid, r: number, c: number) => (g[r] ? g[r][c] ?? null : null)

/** Same-colour connected cluster including (r,c). */
export function cluster(g: Grid, r: number, c: number, s: GridShape): [number, number][] {
  const col = get(g, r, c)
  if (col === null) return []
  const seen = new Set<string>([`${r},${c}`])
  const out: [number, number][] = [[r, c]]
  const q: [number, number][] = [[r, c]]
  while (q.length) {
    const [cr, cc] = q.shift()!
    for (const [nr, nc] of neighbors(cr, cc, s)) {
      const k = `${nr},${nc}`
      if (!seen.has(k) && get(g, nr, nc) === col) { seen.add(k); out.push([nr, nc]); q.push([nr, nc]) }
    }
  }
  return out
}

/** Bubbles not connected to the top row. */
export function floating(g: Grid, s: GridShape): [number, number][] {
  const seen = new Set<string>()
  const q: [number, number][] = []
  for (let c = 0; c < s.cols; c++) if (get(g, 0, c) !== null) { seen.add(`0,${c}`); q.push([0, c]) }
  while (q.length) {
    const [cr, cc] = q.shift()!
    for (const [nr, nc] of neighbors(cr, cc, s)) {
      const k = `${nr},${nc}`
      if (!seen.has(k) && get(g, nr, nc) !== null) { seen.add(k); q.push([nr, nc]) }
    }
  }
  const out: [number, number][] = []
  g.forEach((row, r) => row.forEach((v, c) => { if (v !== null && !seen.has(`${r},${c}`)) out.push([r, c]) }))
  return out
}

export function remove(g: Grid, cells: [number, number][]): Grid {
  const n = g.map((row) => row.slice())
  for (const [r, c] of cells) if (n[r]) n[r][c] = null
  return n
}

export const isEmpty = (g: Grid) => g.every((row) => row.every((v) => v === null))
export const coloursPresent = (g: Grid) => [...new Set(g.flat().filter((v): v is number => v !== null))]

/** Row/col of the cell nearest to a point, given geometry (r = bubble radius). */
export function cellAt(x: number, y: number, r: number, s: GridShape): [number, number] {
  const rowH = r * Math.sqrt(3)
  const row = Math.max(0, Math.round((y - r) / rowH))
  const odd = (row + s.shift) % 2 === 1
  const col = Math.max(0, Math.min(s.cols - 1, Math.round((x - r - (odd ? r : 0)) / (2 * r))))
  return [row, col]
}
export function cellCenter(row: number, col: number, r: number, s: GridShape): [number, number] {
  const odd = (row + s.shift) % 2 === 1
  return [r + col * 2 * r + (odd ? r : 0), r + row * r * Math.sqrt(3)]
}

/** Find the nearest empty cell to (row,col) (itself or a neighbour) that touches an existing bubble or row 0. */
export function snapCell(g: Grid, row: number, col: number, s: GridShape, r: number, x: number, y: number): [number, number] {
  const cands: [number, number][] = get(g, row, col) === null ? [[row, col]] : []
  for (const n of neighbors(row, col, s)) if (get(g, n[0], n[1]) === null) cands.push(n)
  if (!cands.length) return [row + 1, col]
  let best = cands[0], bd = Infinity
  for (const cnd of cands) {
    const [cx, cy] = cellCenter(cnd[0], cnd[1], r, s)
    const d = (cx - x) ** 2 + (cy - y) ** 2
    if (d < bd) { bd = d; best = cnd }
  }
  return best
}

export function setCell(g: Grid, row: number, col: number, v: number): Grid {
  const n = g.map((r) => r.slice())
  while (n.length <= row) n.push([])
  n[row] = n[row].slice()
  while (n[row].length < col + 1) n[row].push(null)
  n[row][col] = v
  return n
}

export function makeRows(rows: number, s: GridShape, colours: number, rnd: () => number): Grid {
  return Array.from({ length: rows }, () => Array.from({ length: s.cols }, () => Math.floor(rnd() * colours)))
}
