import { useEffect, useRef } from 'react'
import { useStore } from './store'
import { useTablesStore } from '@/brain-gym/tables/stats'
import { authEnabled, loadCloud, onUser, saveCloud } from './auth'
import { mergeProgress } from './sync'
import type { Progress } from './sync'

const snapshot = (): Progress => {
  const s = useStore.getState(), t = useTablesStore.getState()
  return { best: s.best, plays: s.plays, wins: s.wins, playSeconds: s.playSeconds, puzzlesByDay: s.puzzlesByDay, stickers: s.stickers, favs: s.favs, difficulty: s.difficulty, tables: { stats: t.stats, tables: t.tables } }
}
const apply = (p: Progress) => {
  useStore.getState().applyProgress({ best: p.best, plays: p.plays, wins: p.wins, playSeconds: p.playSeconds, puzzlesByDay: p.puzzlesByDay, stickers: p.stickers, favs: p.favs, difficulty: p.difficulty as Record<string, 'easy' | 'normal' | 'hard'> })
  if (p.tables) { useTablesStore.getState().setStats(p.tables.stats); if (p.tables.tables) useTablesStore.getState().setTables(p.tables.tables) }
}

/**
 * Keeps progress in sync with the signed-in account:
 * on login → merge device + cloud → apply → save; afterwards every change is saved (debounced 2 s).
 * Does nothing when auth is not configured (guests keep everything on-device).
 */
export function useCloudSync(onWelcome: (name: string) => void) {
  const uidRef = useRef<string | null>(null)
  const mergedDevices = useRef<Set<string>>(new Set())
  useEffect(() => {
    if (!authEnabled) return
    let timer = 0
    const save = () => { const uid = uidRef.current; if (!uid) return; window.clearTimeout(timer); timer = window.setTimeout(() => { saveCloud(uid, { ...snapshot(), devices: [...mergedDevices.current] }).catch(() => {}) }, 2000) }
    const unsubStore = useStore.subscribe(save)
    const unsubTables = useTablesStore.subscribe(save)
    const deviceId = (() => { let id = localStorage.getItem('playpatch-device'); if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('playpatch-device', id) } return id })()
    const unsubAuth = onUser(async (u) => {
      const prev = uidRef.current
      useStore.getState().setUser(u)
      uidRef.current = u?.uid ?? null
      if (!u || u.uid === prev) return
      try {
        const cloud = (await loadCloud(u.uid)) as (Progress & { devices?: string[] }) | null
        const seen = new Set(cloud?.devices ?? [])
        const merged = mergeProgress(snapshot(), cloud, seen.has(deviceId))
        seen.add(deviceId); mergedDevices.current = seen
        apply(merged)
        await saveCloud(u.uid, { ...merged, devices: [...seen] })
      } catch { /* offline: keep device progress; it will sync on the next change */ }
      onWelcome(u.name)
    })
    return () => { unsubStore(); unsubTables(); unsubAuth(); window.clearTimeout(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
