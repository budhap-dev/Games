# Deployment & CI

How PlayPatch gets built, checked and shipped. Two independent systems are involved — **Vercel** (deploys) and **GitHub Actions** (checks). Neither calls the other.

## At a glance

```
                 push / PR webhook
GitHub repo ───────────────────────► Vercel (GitHub App, team work-0cc7 / project games)
budhap-dev/Games                       ├─ push to main  → Production  https://games-work-0cc7.vercel.app
   │                                   └─ any PR branch → Preview     https://games-<hash>-work-0cc7.vercel.app
   │                                       (+ "Vercel" check + vercel[bot] PR comment)
   │ push / PR
   └──────────► GitHub Actions  .github/workflows/ci.yml
                └─ test-and-build: npm ci → npm test → npm run build   (✅/❌ check only — does NOT deploy)
```

## 1. Vercel (the deploys)

- **How it's wired:** the repo was imported into Vercel, which installed the Vercel GitHub App on `budhap-dev/Games`. Vercel receives a webhook for every push and PR and builds on its own infrastructure. There is **no** Vercel token, secret or workflow step in this repo.
- **Dashboard:** https://vercel.com/work-0cc7/games
- **Production:** every push to `main` (i.e. every merged PR) → **https://playpatch.vercel.app** (added 2026-08-22 as a project domain; `games-work-0cc7.vercel.app` still works)
- **Previews:** every PR branch → a unique URL such as `https://games-8ur3pm0jf-work-0cc7.vercel.app`, plus a branch alias `games-git-<branch>-work-0cc7.vercel.app`. The URL is posted on the PR by `vercel[bot]` and shows up as the **Vercel** check.
- **Build settings:** Vercel's Vite preset (`npm run build` → `dist/`). Repo-side config lives in [`vercel.json`](../vercel.json):
  - rewrite everything that isn't a static asset to `/index.html` so client-side routes (`/play/snake`, `/stickers`, `/grown-ups`) load directly and survive refresh;
  - `sw.js` and `manifest.webmanifest` are `no-cache` so PWA updates roll out;
  - hashed `/assets/*` are `immutable` for a year.
- **Deployment Protection:** "Vercel Authentication" was on for production when the project was created (every URL 302'd to `vercel.com/sso-api`). It was disabled on 2026-08-22 so kids/parents can open the site. If the site ever redirects to SSO again, check Project → Settings → **Deployment Protection** (and team-level Security settings).
- **Environment variables:** none needed. The app is fully static and makes no network calls after install.

## 2. GitHub Actions (the checks)

- Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — job `test-and-build` on `ubuntu-latest`, Node 20, npm cache.
- Runs on every **pull request** and every **push to `main`**: `npm ci` → `npm test` (Vitest) → `npm run build` (`tsc -b` + Vite).
- It produces a status check only. It **does not** deploy, and Vercel does not wait for it.

### Consequence
Right now a PR with red tests still gets a Vercel preview, and if merged would still reach production. CI and deploys are only linked if you add branch protection.

## 3. Gating production on CI (recommended)

One-time GitHub setting — no new infrastructure:

1. GitHub → repo **Settings → Branches → Add branch protection rule** (or Rulesets).
2. Branch name pattern: `main`.
3. Tick **Require status checks to pass before merging** and select `test-and-build` (optionally also `Vercel`).
4. Optionally tick **Require a pull request before merging**.

With that, `main` (and therefore production) can only receive code whose tests and build passed. Previews are unaffected.

### Alternative: deploy from Actions instead
Only worth it if deploys must be strictly conditional on tests or need custom steps. Sketch:
- In Vercel: Project → Settings → Git → disable automatic deployments (or use an *Ignored Build Step*).
- Add repo secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (from `vercel link` / dashboard).
- Add a job after `test-and-build`:
  ```yaml
  deploy:
    needs: test-and-build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm i -g vercel
      - run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
  ```

## 4. Verifying a deployment

From a terminal with `gh` logged in (no Vercel CLI needed):

```bash
# PR checks (CI + Vercel)
gh pr checks <PR#>

# Latest deployments recorded on GitHub (environment, sha, time)
gh api repos/budhap-dev/Games/deployments --jq '.[]|.environment+" "+.sha[0:7]+" "+.created_at'

# Preview URL of the newest preview deployment
gh api repos/budhap-dev/Games/deployments --jq '[.[]|select(.environment=="Preview")][0].statuses_url' \
  | xargs -I{} gh api {} --jq '[.[]|select(.state=="success")][0].environment_url'

# Production smoke checks: deep link, SW, manifest, caching
U=https://playpatch.vercel.app
for p in / /play/snake /sw.js /manifest.webmanifest; do curl -s -o /dev/null -w "$p %{http_code} %header{cache-control}\n" "$U$p"; done
```

Expected: all `200`; `sw.js` → `no-cache, no-store, must-revalidate`; `/assets/*` → `max-age=31536000, immutable`. A `302` to `vercel.com/sso-api` means Deployment Protection is on again.

## 5. Local equivalents

```bash
npm run dev       # dev server (http://localhost:5173)
npm test          # what CI runs
npm run build     # what CI and Vercel run
npm run preview   # serve dist/ locally (http://localhost:4173) — SPA fallback is built into vite preview
```

## 6. Rollback

Vercel keeps every deployment. To roll production back: Vercel dashboard → Deployments → pick an earlier Production deployment → **Promote to Production** (instant, no rebuild). Or `git revert` the merge commit on `main` and let the integration redeploy.
