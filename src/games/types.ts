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
  /** The moves the player made, in order, so they can see how they got here (shown as "Your steps") */
  steps?: GameStep[]
  /** Heading for the steps panel; defaults to "Your steps" */
  stepsTitle?: string
}

/** One move in the end-screen replay, e.g. { move: '307', result: '🐂 1 · 🐄 2' } */
export interface GameStep {
  /** What was played: a guess, a sum, a column, a word… */
  move: string
  /** What came back: feedback, the right answer, points… */
  result?: string
  /** true = good / correct, false = a mistake, omitted = neutral */
  ok?: boolean
  /** In two-player games, who moved ("You" / "Robot") */
  who?: string
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
