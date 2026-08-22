import type { ComponentType } from 'react'
import type { Category, Difficulty } from '@/shared/store'

export interface GameEnd {
  score: number
  won?: boolean
  message: string
  emoji?: string
  /** Optional extra result lines shown under the score */
  details?: string[]
  /** Optional compact list (e.g. per-answer breakdown) rendered in a small two-column grid */
  list?: { label: string; value: string; ok?: boolean }[]
}

/** Every game is a React component with this contract. */
export interface GameProps {
  difficulty: Difficulty
  paused: boolean
  onScore: (score: number) => void
  onEnd: (result: GameEnd) => void
}

export interface GameMeta {
  id: string
  name: string
  emoji: string
  category: Category
  /** CSS token name for the tile colour, e.g. 'orange' */
  color: 'orange' | 'sky' | 'lime' | 'grape' | 'sun' | 'pink'
  howTo: string
  scoreLabel: string
  /** false = shown on the home grid with a "soon" ribbon */
  ready: boolean
  load?: () => Promise<{ default: ComponentType<GameProps> }>
}
