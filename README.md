# NutriScan

Scan your food, track calories and macros, and build healthier eating habits.

NutriScan is a mobile-friendly web app: snap a photo of a meal, get AI-powered nutrition analysis, and track your daily intake across a dashboard, food diary, and insights views.

## Features

- **AI food scanner** — photo-based meal analysis (calories, protein, carbs, fat) via Google Gemini
- **Dashboard** — daily calorie budget, macro rings, and meal summaries
- **Food diary** — log breakfast, lunch, dinner, and snacks
- **Insights** — charts and trends (built with Recharts)
- **Onboarding** — guided setup with personalized goals
- **Profile** — Google sign-in and cloud sync via Firebase
- **PWA** — installable, works offline (service worker + cached fonts)

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19, Tailwind CSS v4, Vite 8 |
| AI analysis | Google Gemini (`/api/analyze-food`) |
| Auth + database | Firebase Auth (Google), Firestore |
| Rate limiting | Upstash Redis (optional, graceful fallback to in-memory) |
| Error tracking | Sentry (optional) |
| Hosting | Vercel (serverless `api/` functions) |
| Tests | Vitest, Playwright |

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

Other scripts:

```bash
pnpm build      # production build
pnpm preview    # serve the production build locally
pnpm typecheck  # tsc --noEmit
pnpm test       # vitest
pnpm test:e2e   # playwright
pnpm verify     # typecheck + test + build
```

## Environment variables

See [`.env.example`](.env.example) for the full list.

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes (for food scan) | Free key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | No | Override (default: `gemini-3.6-flash`) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No | Global API rate limiting (from Vercel Marketplace → Upstash Redis) |
| `VITE_SENTRY_DSN` | No | Production error tracking |
| `VITE_FIREBASE_*` | Yes (for login/sync) | Firebase web app config (Auth + Firestore) |

## API routes

Served natively by Vercel in production, and emulated under `vite dev` locally (see `devApiPlugin` in [`vite.config.ts`](vite.config.ts)):

- `POST /api/analyze-food` — analyze a food photo / description with Gemini
- `GET /api/health` — health check

## Deployment

Push to `main` — Vercel auto-deploys using [`vercel.json`](vercel.json). Set the environment variables above in the Vercel project dashboard.

## Project structure

```text
├── api/                # Vercel serverless functions (analyze-food, health)
├── src/                # React app (App, Scanner, Dashboard, Diary, Insights, …)
├── dist/               # production build output (gitignored)
├── index.html          # Vite HTML shell
├── vite.config.ts      # Vite + Tailwind + PWA + dev API emulation
├── vercel.json         # Vercel build/deploy config
└── playwright.config.ts / vitest.config.ts  # e2e + unit test config
```
