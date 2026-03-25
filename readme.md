# StreakFlow

> **Build habits. Break records. Own your day.**

StreakFlow is a premium, web-based productivity application that fuses daily task management with streak-driven habit tracking. It is designed for knowledge workers, students, and ambitious individuals who want more than a checklist — they want a system that builds momentum over time.

---

## Table of Contents

- [Why StreakFlow](#why-streakflow)
- [Screenshots](#screenshots)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running in Development](#running-in-development)
- [Running Tests](#running-tests)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Why StreakFlow

Most to-do apps treat every task the same. StreakFlow understands that some tasks are one-offs and others are the daily rituals that define who you are. It separates the two intelligently, gamifies consistency through streaks, and surfaces analytics that show you exactly where your attention is going — and whether it is paying off.

**Core value props:**

- Unified daily task list + habit tracker in one frictionless surface
- Visual streak calendar with heatmaps and personal records
- Offline-first architecture — works reliably on the train, in a basement, anywhere
- Collaborative shared routines for teams and accountability partners
- Keyboard-first navigation for power users
- Accessible by default, multilingual from day one

---

## Screenshots

> Placeholder — add screenshots to `/docs/assets/` and update paths below.

```
docs/
  assets/
    screenshot-dashboard.png
    screenshot-habits.png
    screenshot-analytics.png
```

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/streakflow.git
cd streakflow

# Install all workspace dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start the full development stack (frontend + API + workers)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Prerequisites

| Dependency | Minimum Version | Notes |
|---|---|---|
| Node.js | 20 LTS | Use nvm or fnm for version management |
| npm | 10+ | Comes with Node 20 |
| PostgreSQL | 15+ | Local or via Docker |
| Redis | 7+ | Used for queues, rate-limiting, caching |
| Docker + Compose | 24+ | Optional, but recommended for local infra |

### Start local infrastructure with Docker

```bash
# Spin up Postgres + Redis + Mailhog
docker compose -f docker/compose.dev.yml up -d
```

---

## Installation

```bash
# Install root and all workspace packages
npm install

# Generate Prisma client from schema
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed development data (sample users, habits, tasks)
npm run db:seed
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values.

```dotenv
# ── App ──────────────────────────────────────────────────────────────────
NODE_ENV=development
APP_URL=http://localhost:3000
PORT=3000

# ── Database ─────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://streakflow:secret@localhost:5432/streakflow_dev

# ── Redis ─────────────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Authentication ────────────────────────────────────────────────────────
NEXTAUTH_SECRET=change-me-in-production
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# ── Payments (Stripe) ─────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
STRIPE_PRICE_TEAM_MONTHLY=price_...

# ── Storage (Cloudflare R2 / AWS S3-compatible) ───────────────────────────
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_BUCKET=streakflow-assets

# ── Email (Resend) ────────────────────────────────────────────────────────
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@streakflow.app

# ── Analytics ─────────────────────────────────────────────────────────────
POSTHOG_KEY=
POSTHOG_HOST=https://app.posthog.com

# ── Feature Flags ─────────────────────────────────────────────────────────
UNLEASH_URL=
UNLEASH_CLIENT_KEY=

# ── Monitoring ────────────────────────────────────────────────────────────
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
```

> **Never commit `.env.local` or any file containing real secrets.**
> The `.gitignore` already excludes all `.env*.local` files.

---

## Running in Development

```bash
# Full stack (Next.js dev server + background worker)
npm run dev

# Frontend only (no worker processes)
npm run dev:web

# Background worker only (streak calculations, email digests)
npm run dev:worker

# Prisma Studio — GUI for your local database
npm run db:studio
```

### Useful dev commands

```bash
# Lint all workspaces
npm run lint

# Type-check all workspaces
npm run typecheck

# Format with Prettier
npm run format
```

---

## Running Tests

```bash
# Run all tests (unit + integration)
npm test

# Unit tests only (fast, no DB)
npm run test:unit

# Integration tests (requires running Postgres + Redis)
npm run test:integration

# End-to-end tests with Playwright
npm run test:e2e

# E2E with UI (interactive debugging)
npm run test:e2e:ui

# Coverage report
npm run test:coverage
```

Coverage thresholds enforced in CI:

| Layer | Minimum |
|---|---|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

---

## Building for Production

```bash
# Build the Next.js app
npm run build

# Preview the production build locally
npm run start

# Analyse bundle size
npm run analyze
```

### Docker production image

```bash
# Build
docker build -f docker/Dockerfile.production -t streakflow:latest .

# Run
docker run -p 3000:3000 --env-file .env.production streakflow:latest
```

---

## Project Structure

```
streakflow/
├── apps/
│   ├── web/                    # Next.js 14 application (App Router)
│   │   ├── app/                # Routes and layouts
│   │   ├── components/         # React components (feature + shared)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities, API clients, formatters
│   │   ├── stores/             # Zustand state slices
│   │   └── styles/             # Global CSS, Tailwind config
│   └── worker/                 # Background job processor (BullMQ)
│       ├── jobs/               # Individual job handlers
│       └── queues/             # Queue definitions
├── packages/
│   ├── db/                     # Prisma schema + migrations + seed
│   ├── api/                    # tRPC router definitions
│   ├── auth/                   # NextAuth.js config + adapters
│   ├── ui/                     # Shared design system components
│   ├── config/                 # Shared ESLint, TS, Tailwind configs
│   └── types/                  # Shared TypeScript types
├── docs/                       # Additional documentation + assets
├── docker/                     # Docker and Compose files
├── scripts/                    # CLI helpers (seed, migrate, etc.)
├── .github/
│   └── workflows/              # CI/CD pipeline definitions
├── .env.example
├── package.json                # Root workspace config
├── turbo.json                  # Turborepo pipeline
└── README.md
```

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Follow the [Conventional Commits](https://www.conventionalcommits.org/) spec for commit messages
3. Ensure all tests pass and coverage thresholds are met
4. Open a pull request against `main` with a clear description
5. At least one maintainer review is required before merging

See `CONTRIBUTING.md` for the full contributor guide including code style, PR template, and release process.

---

## License

StreakFlow is source-available software. The code in this repository is provided under the **StreakFlow Community License**:

- Free to use for personal, non-commercial projects
- Commercial use, self-hosting for profit, and white-labelling require a commercial license
- See `LICENSE` for the complete terms

© 2025 StreakFlow, Inc. All rights reserved.
