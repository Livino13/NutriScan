# NutriScan

> Snap your food, track calories and macros, and build healthier eating habits — offline-first, with optional cloud sync.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://nutriscan-nine-omega.vercel.app)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%2B_Firestore-DD2C00?logo=firebase&logoColor=white)](https://firebase.google.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://nutriscan-nine-omega.vercel.app)

**Live demo:** https://nutriscan-nine-omega.vercel.app

NutriScan is a mobile-friendly web app: snap a photo of a meal, get AI-powered nutrition analysis, and track your daily intake across a dashboard, food diary, and insights views. It works fully offline out of the box — sign in with Google to back up and sync your diary across devices.

## Table of contents

- [Features](#features)
- [How it works](#how-it-works)
- [Cloud sync](#cloud-sync)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API routes](#api-routes)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

## Features

- **AI food scanner** — live camera viewfinder with capture, plus upload/drag-and-drop fallback. Photos are downscaled client-side, then analyzed (calories, protein, carbs, fat, fiber) via Google Gemini. Rename items, pick the meal, and add them one by one. Automatic retries on rate limits and model overload.
- **Dashboard** — daily calorie budget, macro rings, water tracker, and meal summaries at a glance.
- **Food diary** — breakfast, lunch, dinner, and snacks, with manual entry and per-item delete.
- **Insights** — charts and trends over time (built with Recharts).
- **Onboarding** — guided setup with personalized calorie and macro goals (metric + imperial units).
- **Profile** — Google sign-in with Firestore cloud sync, BMI overview, editable goals, JSON backup export/import.
- **PWA** — installable on mobile (192/512 px + maskable icons), works offline via service worker with cached fonts.

## How it works

1. **Onboard** — set your goal (lose, maintain, or gain), activity level, and units to get daily calorie and macro targets.
2. **Scan** — take a photo of your meal. It is downscaled in the browser and sent to `POST /api/analyze-food`, where Gemini identifies the foods and estimates calories, protein, carbs, fat, and fiber per item.
3. **Review** — check the detected items, rename them, choose the meal, and confirm.
4. **Track** — the meal lands in your diary and counts toward your daily rings on the dashboard.
5. **Improve** — open Insights to spot trends (late-night snacking, low-protein days) and adjust.
6. **Sync (optional)** — sign in with Google to back up your diary to Firestore and keep every device in sync.

## Cloud sync

Cloud sync is **optional**. Without Firebase keys the app runs 100% locally (localStorage) and the Profile tab explains how to enable sync.

When signed in:

- Your diary lives in one Firestore document per user: `users/{uid}` (profile, goals, entries, water, `updatedAt`).
- **Entries merge by id** across devices — logging lunch on your phone and dinner on your desktop keeps both.
- **Profile, goals, and water follow last-write-wins** using the document timestamp.
- The **first sign-in keeps the current device's values** and pushes them up, so setup is never overwritten by an empty cloud doc.
- Changes **auto-push after ~2.5 s**, other devices update **live**, and a **Sync Now** button forces a round-trip.
- The Firebase SDK is dynamically imported, so offline users never download it (~7 KB of sync plumbing in the main bundle instead of ~400 KB).

Firestore rules (owner-only access) are documented in [`.env.example`](.env.example).

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19, Tailwind CSS v4, Vite 8, TypeScript 5 |
| Charts | Recharts (lazy-loaded) |
| AI analysis | Google Gemini (`/api/analyze-food`) |
| Auth + database | Firebase Auth (Google), Firestore (both lazy-loaded) |
| Rate limiting | Upstash Redis (optional, graceful fallback to in-memory) |
| Error tracking | Sentry (optional) |
| PWA | `vite-plugin-pwa` (Workbox precache + Google Fonts caching) |
| Hosting | Vercel (serverless `api/` functions) |
| Tests | Vitest (unit), Playwright (e2e, mobile viewport) |

## Getting started

**Prerequisites:** Node.js 22+, pnpm 10+ (see [`.mise.toml`](.mise.toml))

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# then fill in your keys (see "Environment variables" below)

# Start the dev server (http://localhost:8443)
pnpm dev
```

> The dev server emulates the Vercel `api/` functions locally (see `devApiPlugin` in [`vite.config.ts`](vite.config.ts)), so food scanning works without deploying.

Other scripts:

```bash
pnpm build      # production build into dist/
pnpm preview    # serve the production build locally
pnpm typecheck  # tsc --noEmit
pnpm test       # unit tests (vitest)
pnpm test:e2e   # end-to-end tests (playwright, mobile viewport)
pnpm verify     # typecheck + test + build
pnpm format     # format with oxfmt
```

> First e2e run needs the browser binary: `pnpm exec playwright install chromium`.

## Environment variables

See [`.env.example`](.env.example) for the full list with setup instructions.

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (for food scan) | Free key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | No | Model override (default: `gemini-3.6-flash`) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No | Global API rate limiting (Vercel Marketplace → Upstash Redis; per-instance memory limits apply without it) |
| `VITE_SENTRY_DSN` | No | Production error tracking |
| `VITE_FIREBASE_API_KEY` et al. | Yes (for login/sync) | Firebase web app config |

### Enabling cloud sync (5 minutes)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) (Analytics optional).
2. **Build → Authentication → Sign-in method → Google → Enable**, pick a support email, save.
3. **Build → Firestore Database → Create database** (production mode) and publish the owner-only rules from `.env.example`.
4. **Project overview → Add app → Web**, copy the config values into `.env` (and into Vercel's env vars for production).
5. **Authentication → Settings → Authorized domains**: add `localhost` and your production domain.

## API routes

Served natively by Vercel in production, and emulated under `vite dev` locally:

| Route | Method | Description |
|---|---|---|
| `/api/analyze-food` | POST | Accepts a food photo (base64 data URL in `{ "image" }`), returns `{ "foods": [...] }` with calories and macros per item |
| `/api/health` | GET | Health check (`{ "ok": true }`) |

`analyze-food` details:

- Rate-limited to **20 requests/min per IP** (Upstash sliding window, in-memory fallback).
- Rejects bodies over ~6 MB (`413`); the client downscales photos to stay well under that.
- 30 s upstream timeout; client aborts at 60 s with retries on `429`/`502`/`503`/`504`.
- Error codes: `400` missing/invalid image · `405` wrong method · `413` too large · `429` rate-limited · `500` key missing/server error · `502`/`504` vision API failure/timeout.

## Deployment

Two supported paths:

- **Full app (recommended):** connect the repo to Vercel (import project → set env vars → deploy). Pushes to `main` auto-deploy using [`vercel.json`](vercel.json). Set `GEMINI_API_KEY` and (optionally) Firebase + Upstash vars in the project settings.
- **Static demo:** serve the prebuilt `dist/` as a static site — e.g. `vercel ./dist --prod --yes --name nutriscan`. Note this serves the UI only; `/api/*` and login-backed sync require the full deployment.

> `vercel.json` sets `maxDuration: 60` on the scan function (needs a Pro plan) so long Gemini calls aren't cut off on Hobby's shorter limit.

## Project structure

```text
├── api/                      # Vercel serverless functions (analyze-food, health)
├── e2e/                      # Playwright specs (mobile viewport, mocked scan API)
├── public/                   # icon.svg + PWA raster icons (192/512, maskable)
├── src/
│   ├── App.tsx               # shell + routing + cloud-sync wiring
│   ├── Scanner / Dashboard / Diary / Insights / Onboarding / Profile
│   ├── firebase.ts           # lazy Firebase init (null when unconfigured)
│   ├── sync.ts               # merge strategy (entries union, last-write-wins)
│   ├── useCloudSync.ts       # sign-in, auto-push, live updates
│   ├── storage.ts            # localStorage layer + backup export/import
│   ├── *.test.ts             # unit tests (storage, utils, sync)
│   └── index.css             # Tailwind v4 theme + global styles
├── dist/                     # production build output (gitignored)
├── index.html                # Vite HTML shell (Figma Make slots)
├── vite.config.ts            # Vite + Tailwind + PWA + dev API emulation
├── vercel.json               # function config + security headers
├── playwright.config.ts      # e2e test config (cross-platform env)
└── vitest.config.ts          # unit test config
```

Local data lives under `localStorage` keys prefixed `ns_` (`ns_profile`, `ns_goals`, `ns_entries`, `ns_water`, …); entries older than 90 days are trimmed automatically.

## Roadmap

### Shipped

- [x] AI food scanning with Gemini
- [x] Dashboard, diary, insights, onboarding, profile
- [x] Water intake tracking
- [x] Google sign-in + Firestore cloud sync
- [x] PWA offline support
- [x] Live demo deployment

### Next up

- [ ] Barcode lookup for packaged foods (Open Food Facts)
- [ ] Text-based meal logging (describe a dish, no photo needed)
- [ ] Per-item portion editor (adjust grams after scanning)
- [ ] Favorite meals and one-tap re-logging
- [ ] Weekly nutrition reports with highlights and low-protein flags
- [ ] Meal-reminder notifications (wiring up the Profile toggle via Notification API + service worker)
- [ ] Weight progress tracking with trend chart
- [ ] Custom foods and saved recipes

### Exploring

- [ ] Micronutrient detail per item (sugar and sodium are already detected — surface them)
- [ ] Streaks and goal celebrations
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Apple Health / Health Connect import
- [ ] Shareable progress cards and PDF export
- [ ] CI checks on pull requests (verify + e2e)

### Housekeeping

- [x] Choose an open-source license (MIT)
- [ ] Prune leftover Figma scaffold duplicates (`imports/`, `src/imports/Component1`)

## FAQ

**Which package manager should I use?**
pnpm (there's a `pnpm-lock.yaml`). npm works in a pinch, but don't commit a `package-lock.json`.

**Do I need Firebase to run the app?**
No. Without Firebase keys everything works locally in your browser. Sign-in and cross-device sync light up once the keys are set (see [Cloud sync](#cloud-sync)).

**Sign-in popup was blocked / closed instantly.**
Allow popups for the site and try again. In private windows, use the upload flow — popups are often restricted there.

**"This domain is not authorized" on sign-in.**
Add the exact domain (e.g. `localhost`, your Vercel URL) under Firebase console → Authentication → Settings → Authorized domains.

**Where is my data stored?**
Locally under `localStorage` keys starting with `ns_`. When signed in, a copy syncs to Firestore at `users/{your-uid}`. Export a JSON backup from Profile → Your Data any time.

**The dev server port is already in use.**
The port comes from `$PORT` (default `8443`). Free it or start with another one (PowerShell: `$env:PORT="8444"; pnpm dev`).

**Food scan fails locally.**
Make sure `GEMINI_API_KEY` is set in `.env` and restart the dev server — API handlers read env at startup.

**Images are large — any limits?**
Client-side photos are downscaled to max 1024 px and rejected client-side over ~5 MB base64; the API rejects bodies over ~6 MB.

## Contributing

1. Fork the repo and create a feature branch (`git checkout -b feat/my-change`).
2. Run `pnpm verify` before pushing (typecheck + tests + build); run `pnpm test:e2e` for UI changes (needs `pnpm exec playwright install chromium` once).
3. Format with `pnpm format`.
4. Open a pull request against `main` with a short description and screenshots for UI changes.

## License

MIT — see [LICENSE](LICENSE).
