# PlayPatch 🎮

A bright little patch of playground on the web: classic arcade games and brain-teasers for children, playable on phones, tablets and desktops. Installable as a PWA and fully playable offline. No ads, no accounts, no chat — progress stays on the device.

Read the full product story in [docs/PRODUCT_STORY.md](docs/PRODUCT_STORY.md).

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

MVP (v0.1): Snake, Tic-Tac-Toe, Memory Match, Sudoku Jr., Maze Runner, Sticker Book, Grown-ups corner (hold-to-enter, daily limit, sound, reduced motion), offline PWA. Remaining titles from the story appear on the home grid with a "Soon" ribbon.
