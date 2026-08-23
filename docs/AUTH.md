# Optional Google sign-in & cloud progress

Guests can play everything with progress saved on the device. When Firebase is configured, a **Sign in** button appears in the Home header; signed-in players get a "👋 Welcome, *name*!" greeting and their scores, stickers, favourites, difficulty choices and Table Rockstars stats are merged with and saved to their Google account (synced across devices, debounced 2 s after each change).

Firebase is **lazy-loaded** — guests never download it.

## Setup (≈5 minutes)
1. **Firebase project**: https://console.firebase.google.com → Add project → (Analytics not needed).
2. **Web app**: Project settings → *Your apps* → Web (`</>`) → register → copy `apiKey`, `authDomain`, `projectId`, `appId`.
3. **Auth**: Build → Authentication → Sign-in method → enable **Google** (set a support email).
   Settings → *Authorized domains* → add `playpatch.vercel.app` (and any preview/custom domains; `localhost` is there by default).
4. **Firestore**: Build → Firestore Database → Create (production mode) → Rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
5. **Vercel env vars**: Project → Settings → Environment Variables (Production + Preview):
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` → redeploy.
   Locally: copy `.env.example` to `.env.local` and fill the values.

Firebase web API keys are public identifiers; security comes from the Firestore rules above + Google's OAuth.

## How the merge works (`src/shared/sync.ts`)
bests → highest · plays/wins/time/puzzles → summed across devices (each device is remembered so it isn't double-counted) · stickers & favourites → union · difficulty/settings → device wins · Table Rockstars per-fact stats → the record with more attempts.

## Privacy
Only display name, photo URL and game progress are stored, in `users/{uid}`. Sign-in is intended for grown-ups / players 13+ (Google account age rules); children can keep playing as guests.
