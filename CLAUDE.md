# PlayPatch — notes for Claude

- Kids' games web app. Product story: docs/PRODUCT_STORY.md. Keep everything child-safe: no ads, accounts, chat, external links or network calls.
- Stack: React 18 + TypeScript + Vite + vite-plugin-pwa, Zustand (persisted in localStorage under `playpatch-v1`), Vitest.
- Every game implements `GameProps` from src/games/types.ts and is registered in src/games/registry.ts (lazy-loaded). The shell (src/app/GamePage.tsx) owns start/pause/end UI, scoring, bests, stickers and confetti — games only report `onScore`/`onEnd`.
- Put game rules in a pure `logic.ts` next to the component with a `logic.test.ts`. Real-time games use `useGameLoop` + `useCanvasSize`; direction input via `useDirectionInput` (+ `<DPad>` for touch).
- Commands: `npm run dev`, `npm test`, `npm run build` (runs `tsc -b` first — keep it type-clean; `noUnusedLocals` is on).
- Styling is plain CSS with tokens in src/app/styles.css. Theming: light tokens on :root, dark tokens under both `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` and `:root[data-theme="dark"]`; palettes override accents via `:root[data-palette="…"]`. App.tsx stamps data-theme/data-palette from the store. Never hard-code dark-only colours (use tokens) — canvases may use literal colours since they paint their own ground. Fonts: Fredoka (display), Nunito (body). Touch targets ≥ 48px; in-game text ≥ 18px.
- Deploys: Vercel GitHub integration (push to main → production https://playpatch.vercel.app, PRs → previews); GitHub Actions CI only runs test+build and does not deploy. Details and verification commands: docs/DEPLOYMENT.md.
- Optional Google sign-in: src/shared/auth.ts (Firebase, lazy-loaded, enabled only with VITE_FIREBASE_* env), sync.ts (pure merge, tested), useCloudSync.ts (login merge + debounced save). Guests must always work with no env configured. Setup in docs/AUTH.md.
