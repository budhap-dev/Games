import { describe, it, expect } from 'vitest'
import { robotMove, winner } from './logic'
import type { Board } from './logic'

const b = (s: string): Board => s.split('').map((c) => (c === '.' ? null : (c as 'X' | 'O')))

describe('tic-tac-toe', () => {
  it('detects a winner', () => {
    expect(winner(b('XXX......'))?.mark).toBe('X')
    expect(winner(b('O...O...O'))?.mark).toBe('O')
    expect(winner(b('XOXOXOOXO'))).toBeNull()
  })
  it('robot takes a winning move on normal/hard', () => {
    expect(robotMove(b('OO.XX....'), 'O', 'normal')).toBe(2)
    expect(robotMove(b('OO.XX....'), 'O', 'hard')).toBe(2)
  })
  it('robot blocks on normal/hard', () => {
    expect(robotMove(b('XX.O.....'), 'O', 'normal')).toBe(2)
    expect(robotMove(b('XX.O.....'), 'O', 'hard')).toBe(2)
  })
  it('hard robot never loses from an empty board vs. a greedy player', () => {
    // play X greedily (win > block > first empty) vs perfect O; O must not lose
    let board: Board = Array(9).fill(null)
    let turn: 'X' | 'O' = 'X'
    while (!winner(board) && board.some((c) => !c)) {
      const i = turn === 'X' ? robotMove(board, 'X', 'normal', () => 0) : robotMove(board, 'O', 'hard', () => 0)
      board[i] = turn
      turn = turn === 'X' ? 'O' : 'X'
    }
    expect(winner(board)?.mark).not.toBe('X')
  })
})
