import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Difficulty = 'easy' | 'normal' | 'hard'
export type Category = 'arcade' | 'brain'

export interface GameResult {
  gameId: string
  category: Category
  score: number
  won?: boolean
}

export const todayKey = () => new Date().toISOString().slice(0, 10)

interface State {
  sound: boolean
  reducedMotion: boolean
  dailyLimitMin: number // 0 = no limit
  difficulty: Record<string, Difficulty>
  best: Record<string, number>
  plays: Record<string, number>
  wins: Record<string, number>
  playSeconds: Record<string, number> // date -> seconds
  puzzlesByDay: Record<string, number> // date -> solved
  stickers: string[]
  setSound: (v: boolean) => void
  setReducedMotion: (v: boolean) => void
  setDailyLimit: (min: number) => void
  setDifficulty: (gameId: string, d: Difficulty) => void
  recordResult: (r: GameResult) => { isBest: boolean }
  addPlaySeconds: (s: number) => void
  unlockSticker: (id: string) => boolean
  resetAll: () => void
}

const initial = {
  sound: true,
  reducedMotion: false,
  dailyLimitMin: 0,
  difficulty: {},
  best: {},
  plays: {},
  wins: {},
  playSeconds: {},
  puzzlesByDay: {},
  stickers: [],
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setSound: (sound) => set({ sound }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setDailyLimit: (dailyLimitMin) => set({ dailyLimitMin }),
      setDifficulty: (gameId, d) => set((s) => ({ difficulty: { ...s.difficulty, [gameId]: d } })),
      recordResult: ({ gameId, category, score, won }) => {
        const s = get()
        const prevBest = s.best[gameId] ?? 0
        const isBest = score > prevBest
        const day = todayKey()
        set({
          best: isBest ? { ...s.best, [gameId]: score } : s.best,
          plays: { ...s.plays, [gameId]: (s.plays[gameId] ?? 0) + 1 },
          wins: won ? { ...s.wins, [gameId]: (s.wins[gameId] ?? 0) + 1 } : s.wins,
          puzzlesByDay:
            category === 'brain' && won
              ? { ...s.puzzlesByDay, [day]: (s.puzzlesByDay[day] ?? 0) + 1 }
              : s.puzzlesByDay,
        })
        return { isBest }
      },
      addPlaySeconds: (sec) =>
        set((s) => {
          const day = todayKey()
          return { playSeconds: { ...s.playSeconds, [day]: (s.playSeconds[day] ?? 0) + sec } }
        }),
      unlockSticker: (id) => {
        if (get().stickers.includes(id)) return false
        set((s) => ({ stickers: [...s.stickers, id] }))
        return true
      },
      resetAll: () => set({ ...initial, sound: get().sound, reducedMotion: get().reducedMotion }),
    }),
    { name: 'playpatch-v1' },
  ),
)

export const useTodaySeconds = () => useStore((s) => s.playSeconds[todayKey()] ?? 0)
