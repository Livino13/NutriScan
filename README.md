# NutriScan

> Scan your food, track calories and macros, and build healthier eating habits.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://nutriscan-nine-omega.vercel.app)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://nutriscan-nine-omega.vercel.app)

**Live demo:** https://nutriscan-nine-omega.vercel.app

NutriScan is a mobile-friendly web app: snap a photo of a meal, get AI-powered nutrition analysis, and track your daily intake across a dashboard, food diary, and insights views.

## Table of contents

- [Features](#features)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API routes](#api-routes)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [Contributing](#contributing)

## Features

- **AI food scanner** — photo-based meal analysis (calories, protein, carbs, fat) via Google Gemini
- **Dashboard** — daily calorie budget, macro rings, and meal summaries at a glance
- **Food diary** — log breakfast, lunch, dinner, and snacks
- **Insights** — charts and trends over time (built with Recharts)
- **Onboarding** — guided setup with personalized calorie and macro goals
- **Profile** — Google sign-in and cloud sync via Firebase
- **PWA** — installable on mobile, works offline (service worker + cached fonts)

## How it works

1. **Onboard** — set your goal (lose, maintain, or gain), activity level, and dietary preferences to get daily calorie and macro targets.
2. **Scan** — take a photo of your meal (or describe it). The image is sent to `POST /api/analyze-food`, where Gemini identifies the foods and estimates calories, protein, carbs, and fat per item.
3. **Review** — check the detected items, adjust portions, and confirm.
4. **Track** — the meal lands in your diary and counts toward your daily rings on the dashboard.
5. **Improve** — open Insights to spot trends (late-night snacking, low-protein days) and adjust.

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19, Tailwind CSS v4, Vite 8, TypeScript 5 |
| Charts | Recharts |
| AI analysis | Google Gemini (`/api/analyze-food`) |
| Auth + database | Firebase Auth (Google), Firestore |
| Rate limiting | Upstash Redis (optional, graceful fallback to in-memory) |
| Error tracking | Sentry (optional) |
| Hosting | Vercel (serverless `api/` functions) |
| Tests | Vitest (unit), Playwright (e2e) |

## Getting started

**Prerequisites:** Node.js 22+, pnpm 10+

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
pnpm test:e2e   # end-to-end tests (playwright)
pnpm verify     # typecheck + test + build
```

## Environment variables

See [`.env.example`](.env.example) for the full list with setup instructions.

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (for food scan) | Free key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | No | Model override (default: `gemini-3.6-flash`) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No | Global API rate limiting (Vercel Marketplace → Upstash Redis; per-instance memory limits apply without it) |
| `VITE_SENTRY_DSN` | No | Production error tracking |
| `VITE_FIREBASE_API_KEY` et al. | Yes (for login/sync) | Firebase web app config — see `.env.example` for the console setup steps |

## API routes

Served natively by Vercel in production, and emulated under `vite dev` locally:

| Route | Method | Description |
|---|---|---|
| `/api/analyze-food` | POST | Accepts a food photo (base64) and/or description, returns detected items with calories and macros |
| `/api/health` | GET | Health check (`{ "ok": true }`) |

## Deployment

Two supported paths:

- **Full app (recommended):** connect the repo to Vercel (import project → set env vars → deploy). Pushes to `main` auto-deploy using [`vercel.json`](vercel.json).
- **Static demo:** serve the prebuilt `dist/` as a static site — e.g. `vercel ./dist --prod --yes --name nutriscan`. Note this serves the UI only; `/api/*` and login-backed sync require the full deployment.

## Project structure

```text
├── api/                      # Vercel serverless functions (analyze-food, health)
├── src/                      # React app
│   ├── App.tsx               # shell + routing
│   ├── Scanner / Dashboard / Diary / Insights / Onboarding / Profile
│   └── index.css             # Tailwind v4 theme + global styles
├── dist/                     # production build output (gitignored)
├── index.html                # Vite HTML shell (Figma Make slots)
├── vite.config.ts            # Vite + Tailwind + PWA + dev API emulation
├── vercel.json               # function config + security headers
├── .figma/                   # Figma Make site config + tooling
├── playwright.config.ts      # e2e test config
└── vitest.config.ts          # unit test config
```

## Roadmap

- [x] AI food scanning with Gemini
- [x] Dashboard, diary, insights, onboarding, profile
- [x] PWA offline support
- [x] Live demo deployment
- [ ] Barcode lookup for packaged foods
- [ ] Weekly nutrition reports
- [ ] Water intake tracking
- [ ] Multi-language support

## FAQ

**Which package manager should I use?**
pnpm (there's a `pnpm-lock.yaml`). npm works in a pinch, but don't commit a `package-lock.json`.

**The dev server port is already in use.**
The port comes from `$PORT` (default `8443`). Free it or start with another one: `PORT=8444 pnpm dev` (PowerShell: `$env:PORT="8444"; pnpm dev`).

**Food scan fails locally.**
Make sure `GEMINI_API_KEY` is set in `.env` and restart the dev server — API handlers read env at startup.

**Images are large — any limits?**
Client-side photos are downscaled before upload; the dev API rejects JSON bodies over ~7 MB.

## Contributing

1. Fork the repo and create a feature branch (`git checkout -b feat/my-change`).
2. Run `pnpm verify` before pushing (typecheck + tests + build).
3. Open a pull request against `main` with a short description and screenshots for UI changes.
