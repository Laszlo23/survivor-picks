# SurvivorPicks — Prediction Game

A **Survivor-style Prediction Market** web app where users predict episode outcomes (challenge winners, eliminations, twists) and compete for points on a leaderboard. **No real money** — just bragging rights.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8)

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your database URL and email provider settings
```

### 3. Set up database

```bash
npx prisma db push     # Create tables
npm run db:seed         # Seed with sample data
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with scoring explanation and public leaderboard preview |
| `/auth/signin` | Email magic link sign-in |
| `/dashboard` | User dashboard with stats, next episode, quick picks |
| `/season/[id]/episode/[id]` | Episode prediction page with questions |
| `/leaderboard` | Full leaderboard with search and pagination |
| `/profile` | User profile with stats, badges, recent predictions |
| `/admin` | Admin panel for managing seasons, episodes, questions |

---

## Scoring System

All scoring logic lives in `/src/lib/scoring.ts`.

### Base Points

Every correct prediction earns **100 base points**.

### Odds Multiplier (American Odds)

Odds represent difficulty. Harder predictions pay more.

| Odds | Multiplier | Points if correct |
|------|-----------|-------------------|
| +100 (even) | 2.0x | 200 |
| +150 | 2.5x | 250 |
| +200 | 3.0x | 300 |
| +300 | 4.0x | 400 |
| -110 (favorite) | 1.91x | 191 |
| -200 (heavy fav) | 1.5x | 150 |

**Formula:** `points = 100 × multiplier`

### Risk Bet (1.5x)

Toggle "Risk Bet" on any prediction for a **1.5x bonus multiplier** if correct.

- **Correct:** `100 × odds_multiplier × 1.5`
- **Wrong:** 0 points (Joker cannot save Risk Bets)

Example: +200 odds with Risk = `100 × 3.0 × 1.5 = 450 pts`

### Immunity Joker

Each user gets **3 Jokers per season**. Apply to a prediction before lock time.

- If the prediction is **wrong**, you still get **100 base points** (instead of 0)
- If the prediction is **correct**, no effect (Joker is still consumed)
- **Cannot** be used with Risk Bets

### Streaks

A "streak" = consecutive episodes where you got **≥1 prediction correct**.

- **Streak bonus:** Starting from episode 2 of a streak, earn `25 × (streak_length - 1)` bonus points
- Example: 5-episode streak = `25 × 4 = 100` bonus points that episode
- If you get 0 correct in an episode, streak resets to 0

### Win Rate

`winRate = correctCount / totalCount`

### Tribe Loyalty

Tracked as a vanity stat. Increments when you correctly predict outcomes involving your tribe.

---

## Admin Guide

### Accessing Admin Panel

1. Set `ADMIN_EMAIL` in `.env` to your email
2. Sign in with that email
3. Navigate to `/admin`

### Workflow

1. **Create a Season** → Toggle "Active"
2. **Create Episodes** → Set air date, lock time
3. **Create Questions** → Set type, prompt, odds, options
4. **Open Episode** → Click "Open" to allow predictions
5. **Lock Episode** → Click "Lock" when it's time (or wait for auto-lock at lock time)
6. **Resolve Episode** → Select correct answers → Click "Resolve Episode & Score Predictions"

Resolving triggers:
- All predictions scored based on odds + risk + joker
- Streaks updated
- Win rates recalculated
- Badges checked and awarded
- Leaderboard updated

### Episode Status Flow

```
DRAFT → OPEN → LOCKED → RESOLVED
```

---

## Database Schema

Core models:

- **User** — Auth, profile, role (USER/ADMIN)
- **Season** — Container for episodes
- **Episode** — Numbered, with air/lock times
- **Question** — Type (challenge, elimination, twist, etc.), odds, options
- **Prediction** — User's pick per question
- **ScoreEvent** — Points awarded per episode
- **UserSeasonStats** — Aggregated stats per user per season
- **Badge / UserBadge** — Achievement system
- **Tribe / Contestant** — Survivor cast data

---

## Testing

```bash
# Run all tests
npx vitest run

# Watch mode
npx vitest
```

Tests cover:
- Odds conversion (positive & negative American odds)
- Point calculation (base, risk, joker save)
- Streak logic and bonus calculation
- Win rate calculation
- Full episode scoring scenarios

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3 + shadcn/ui
- **Database:** PostgreSQL + Prisma 5
- **Auth:** NextAuth.js (Email magic link)
- **Validation:** Zod
- **Testing:** Vitest
- **Deployment:** Vercel-ready

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for session encryption |
| `NEXTAUTH_URL` | App URL (http://localhost:3000 for dev) |
| `EMAIL_SERVER_HOST` | SMTP host |
| `EMAIL_SERVER_PORT` | SMTP port |
| `EMAIL_SERVER_USER` | SMTP username |
| `EMAIL_SERVER_PASSWORD` | SMTP password |
| `EMAIL_FROM` | Sender email address |
| `ADMIN_EMAIL` | Email auto-promoted to admin role |

---

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run test         # Run tests (watch mode)
npm run test:run     # Run tests once
npm run db:push      # Push schema to database
npm run db:seed      # Seed database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

---

## Legal

This is a **free prediction game for entertainment only**. No real money, no wallet, no payouts, no gambling.
