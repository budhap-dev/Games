# PlayPatch 🎮

A bright little patch of playground on the web: classic arcade games and brain-teasers for children, playable on phones, tablets and desktops. Installable as a PWA and fully playable offline. No ads, no accounts, no chat — progress stays on the device.

Read the full product story in [docs/PRODUCT_STORY.md](docs/PRODUCT_STORY.md). How it ships (Vercel + GitHub Actions) is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Direct links to every game (bookmark / share / auto-start) are in [docs/GAME_LINKS.md](docs/GAME_LINKS.md).

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # unit tests for game logic
npm run build     # production build + service worker in dist/
npm run preview   # serve the production build
```

## Stack

React 18 · TypeScript · Vite · vite-plugin-pwa · Zustand (persisted) · HTML5 Canvas for real-time games · Vitest

## Project layout

```
src/
  app/          shell: Home grid, GamePage (start card / pause / end overlays), Sticker Book, Grown-ups corner
  games/        arcade games — registry.ts lists every game; each folder = one game (component + pure logic + tests)
  brain-gym/    puzzles, same interface as games
  shared/       store (settings, bests, stickers), audio (WebAudio sfx), game loop, input (swipe/keys), D-pad, canvas helpers, confetti
```

## Adding a game

1. Create `src/games/<id>/<Name>Game.tsx` exporting a default component that implements `GameProps`
   (`difficulty`, `paused`, `onScore(n)`, `onEnd({ score, won, message, emoji })`).
2. Keep rules in a pure `logic.ts` with a `logic.test.ts`.
3. Add an entry to `src/games/registry.ts` with `ready: true` and a `load` import.
   The shell handles the start card, difficulty, pause, restart, score pill, best score, stickers and confetti.

## Status

- **v0.1 (MVP)**: Snake, Tic-Tac-Toe, Memory Match, Sudoku Jr., Maze Runner; Sticker Book; Grown-ups corner (hold-to-enter, daily limit, sound, reduced motion); offline PWA.
- **v0.2**: Brainvita, Bubble Pop, Kart Dash, Spot the Difference, What Comes Next?; GitHub Actions CI (test + build).
- **v0.3a**: Whack-a-Mole, Brick Breaker, Connect Four, Odd One Out, Quick Maths.
- **v0.3b**: Fruit Catch, Flappy Bee, Colour Echo, Sliding Puzzle, Tangram — **all 20 titles from the story are now playable.**
- **v0.4a — 🧪 Brain Lab** (teens 14–18): 2048, Minesweeper, Word Guess, Code Breaker, Lights Out.
- **v0.4b**: Cows & Bulls, Nonogram, Make 24, Tower of Hanoi, Checkers vs robot, Sudoku 9×9.
- **v0.5**: 🎸 Table Rockstars — timed times-tables trainer with rock-status ranks and adaptive practice (Brain Gym). **32 games total**.

Live: **https://playpatch.vercel.app** (alias of `games-work-0cc7.vercel.app`; Vercel auto-deploys `main`, PRs get preview URLs).
