import { useStore } from './store'

export interface Sticker { id: string; emoji: string; name: string; hint: string }

type S = ReturnType<typeof useStore.getState>
const totalPlays = (s: S) => Object.values(s.plays).reduce((a, b) => a + b, 0)
const today = () => new Date().toISOString().slice(0, 10)

export const STICKERS: (Sticker & { earned: (s: S) => boolean })[] = [
  { id: 'first', emoji: '🌱', name: 'First Sprout', hint: 'Play your first game', earned: (s) => totalPlays(s) >= 1 },
  { id: 'snake10', emoji: '🍎', name: 'Apple Snacker', hint: 'Eat 10 apples in Snake', earned: (s) => (s.best.snake ?? 0) >= 10 },
  { id: 'snake30', emoji: '🐍', name: 'Super Snake', hint: 'Eat 30 apples in Snake', earned: (s) => (s.best.snake ?? 0) >= 30 },
  { id: 'tttwin', emoji: '🏆', name: 'Tic-Tac-Champ', hint: 'Win a Tic-Tac-Toe game', earned: (s) => (s.wins.tictactoe ?? 0) >= 1 },
  { id: 'memory', emoji: '🧠', name: 'Elephant Memory', hint: 'Finish a Memory Match', earned: (s) => (s.wins.memory ?? 0) >= 1 },
  { id: 'sudoku', emoji: '🔢', name: 'Number Ninja', hint: 'Solve a Sudoku Jr.', earned: (s) => (s.wins.sudoku ?? 0) >= 1 },
  { id: 'maze', emoji: '⭐', name: 'Star Finder', hint: 'Find the star in the Maze', earned: (s) => (s.wins.maze ?? 0) >= 1 },
  { id: 'peg1', emoji: '💎', name: 'Gem Genius', hint: 'Finish Brainvita with one gem left', earned: (s) => (s.wins.brainvita ?? 0) >= 1 },
  { id: 'bubble30', emoji: '🫧', name: 'Bubble Buster', hint: 'Pop 30 bubbles in one game', earned: (s) => (s.best.bubblepop ?? 0) >= 30 },
  { id: 'kart', emoji: '🏁', name: 'Speedy Racer', hint: 'Finish a Kart Dash race', earned: (s) => (s.wins.kartdash ?? 0) >= 1 },
  { id: 'spot', emoji: '🔍', name: 'Eagle Eye', hint: 'Find every difference once', earned: (s) => (s.wins.spot ?? 0) >= 1 },
  { id: 'pattern', emoji: '🔺', name: 'Pattern Pro', hint: 'Get 6+ right in What Comes Next?', earned: (s) => (s.wins.pattern ?? 0) >= 1 },
  { id: 'whack20', emoji: '🐹', name: 'Mole Master', hint: 'Whack 20 moles in one go', earned: (s) => (s.best.whack ?? 0) >= 20 },
  { id: 'bricks', emoji: '🧱', name: 'Brick Smasher', hint: 'Clear every brick', earned: (s) => (s.wins.bricks ?? 0) >= 1 },
  { id: 'c4', emoji: '🔴', name: 'Four-in-a-Row', hint: 'Win a Connect Four game', earned: (s) => (s.wins.connect4 ?? 0) >= 1 },
  { id: 'odd', emoji: '🦆', name: 'Sharp Spotter', hint: 'Get 6+ right in Odd One Out', earned: (s) => (s.wins.oddone ?? 0) >= 1 },
  { id: 'maths', emoji: '➕', name: 'Maths Whizz', hint: 'Score 8+ in Quick Maths', earned: (s) => (s.wins.quickmaths ?? 0) >= 1 },
  { id: 'fruit20', emoji: '🍉', name: 'Fruit Fan', hint: 'Catch 20 fruit in one round', earned: (s) => (s.best.fruitcatch ?? 0) >= 20 },
  { id: 'bee5', emoji: '🐝', name: 'Busy Bee', hint: 'Fly through 5 flower gaps', earned: (s) => (s.best.flappy ?? 0) >= 5 },
  { id: 'echo5', emoji: '🎵', name: 'Echo Ear', hint: 'Reach round 5 in Colour Echo', earned: (s) => (s.best.simon ?? 0) >= 5 },
  { id: 'slider', emoji: '🧩', name: 'Picture Fixer', hint: 'Solve a Sliding Puzzle', earned: (s) => (s.wins.slider ?? 0) >= 1 },
  { id: 'tangram', emoji: '🔷', name: 'Shape Shifter', hint: 'Complete a Tangram', earned: (s) => (s.wins.tangram ?? 0) >= 1 },
  { id: 'all', emoji: '👑', name: 'PlayPatch Champion', hint: 'Try every game', earned: (s) => Object.keys(s.plays).length >= 20 },
  { id: 'brain3', emoji: '🎓', name: 'Brainiac', hint: 'Solve 3 puzzles in one day', earned: (s) => (s.puzzlesByDay[today()] ?? 0) >= 3 },
  { id: 'explorer', emoji: '🧭', name: 'Explorer', hint: 'Try 5 different games', earned: (s) => Object.keys(s.plays).length >= 5 },
  { id: 'twenty', emoji: '🎉', name: 'Party Animal', hint: 'Play 20 games', earned: (s) => totalPlays(s) >= 20 },
]

/** Check every sticker rule; returns any newly unlocked stickers. */
export function awardStickers(): Sticker[] {
  const s = useStore.getState()
  const fresh: Sticker[] = []
  for (const st of STICKERS) {
    if (!s.stickers.includes(st.id) && st.earned(s)) {
      if (useStore.getState().unlockSticker(st.id)) fresh.push(st)
    }
  }
  return fresh
}
