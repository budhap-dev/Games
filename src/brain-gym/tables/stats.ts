import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Stats } from './logic'

interface TablesState {
  stats: Stats
  tables: number[] | null // last chosen tables
  setStats: (s: Stats) => void
  setTables: (t: number[]) => void
}
/** Per-fact history for Table Rockstars — separate store so it can grow without bloating the main one. */
export const useTablesStore = create<TablesState>()(
  persist((set) => ({ stats: {}, tables: null, setStats: (stats) => set({ stats }), setTables: (tables) => set({ tables }) }), { name: 'playpatch-tables-v1' }),
)
