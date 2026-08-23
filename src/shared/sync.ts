/** Merge on-device progress with the cloud copy. Pure so it can be tested. */
export interface Progress {
  best: Record<string, number>; plays: Record<string, number>; wins: Record<string, number>
  playSeconds: Record<string, number>; puzzlesByDay: Record<string, number>
  stickers: string[]; favs: string[]; difficulty: Record<string, string>
  tables?: { stats: Record<string, { seen: number; correct: number; avgMs: number; okMs?: number }>; tables: number[] | null }
}
const maxMap = (a: Record<string, number> = {}, b: Record<string, number> = {}) => { const o = { ...a }; for (const [k, v] of Object.entries(b)) o[k] = Math.max(o[k] ?? 0, v); return o }
const sumMap = (a: Record<string, number> = {}, b: Record<string, number> = {}) => { const o = { ...a }; for (const [k, v] of Object.entries(b)) o[k] = (o[k] ?? 0) + v; return o }
const union = (a: string[] = [], b: string[] = []) => [...new Set([...a, ...b])]

/**
 * bests → max; plays/wins/time/puzzles → sum (cloud was a different device's history); stickers/favs → union;
 * difficulty → local wins; table stats → per fact, keep the one with more attempts.
 * `cloudAlreadyIncludesLocal` avoids double-counting when re-merging the same device.
 */
export function mergeProgress(local: Progress, cloud: Progress | null, cloudAlreadyIncludesLocal = false): Progress {
  if (!cloud) return local
  const add = cloudAlreadyIncludesLocal ? maxMap : sumMap
  const stats: NonNullable<Progress['tables']>['stats'] = { ...(cloud.tables?.stats ?? {}) }
  for (const [k, v] of Object.entries(local.tables?.stats ?? {})) { const c = stats[k]; if (!c || v.seen >= c.seen) stats[k] = v }
  return {
    best: maxMap(cloud.best, local.best),
    plays: add(cloud.plays, local.plays), wins: add(cloud.wins, local.wins),
    playSeconds: add(cloud.playSeconds, local.playSeconds), puzzlesByDay: add(cloud.puzzlesByDay, local.puzzlesByDay),
    stickers: union(cloud.stickers, local.stickers), favs: union(cloud.favs, local.favs),
    difficulty: { ...cloud.difficulty, ...local.difficulty },
    tables: { stats, tables: local.tables?.tables ?? cloud.tables?.tables ?? null },
  }
}
