# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev            # Full stack (Next.js + worker)
npm run dev:web        # Frontend only
npm run dev:worker     # Worker only
npm run db:studio      # Prisma Studio GUI

# Database
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations (dev)
npm run db:seed        # Seed demo data

# Quality
npm run lint           # ESLint all workspaces
npm run typecheck      # TypeScript check all workspaces
npm run format         # Prettier

# Testing
npm test               # All tests (unit + integration)
npm run test:unit      # Fast, no DB required
npm run test:integration  # Requires Postgres + Redis
npm run test:e2e       # Playwright E2E
npm run test:e2e:ui    # E2E with interactive UI
npm run test:coverage  # Coverage report

# Build
npm run build          # Production build
npm run start          # Preview production build
npm run analyze        # Bundle size analysis
```

Local infrastructure (Postgres + Redis + Mailhog):
```bash
docker compose -f docker/compose.dev.yml up -d
```

## Architecture Overview

### Monorepo Structure

```
apps/web/        # Next.js 14 — App Router, React components, Zustand stores
apps/worker/     # BullMQ processor — streak calculations, email digests
packages/db/     # Prisma schema + migrations (packages/db/prisma/schema.prisma)
packages/api/    # tRPC routers (consumed by apps/web via /api/trpc)
packages/auth/   # NextAuth.js v4 config + Prisma adapter
packages/ui/     # Shared design system (Radix UI + CVA variants)
packages/config/ # Shared ESLint, TypeScript, Tailwind presets
packages/types/  # Shared TypeScript types (source of truth for domain models)
```

### Data Flow

1. User actions in `apps/web` call tRPC procedures in `packages/api` via `/api/trpc`
2. tRPC procedures interact with PostgreSQL via Prisma (`packages/db`)
3. Heavy async work (streak recalculation, email digests) is dispatched to BullMQ queues processed by `apps/worker`
4. tRPC context is created in `packages/api/src/trpc.ts` using `getServerSession(authOptions)` — no req/res needed in App Router

### Key Domain Concepts

- **Habits** have streak counters recalculated on each `habits.complete` mutation and nightly by the worker
- **Streak freeze tokens** allow retroactively excusing one missed day (Free: 1/month, Pro: 3/month, Team: 5/month)
- **Tier gating:** Free (5 habits, 30-day history), Pro ($7/mo), Team ($7/seat/mo) — enforced in tRPC middleware via `protectedProcedure` / `proProcedure`
- **PLAN_LIMITS** in `packages/types/src/index.ts` is the single source of truth for plan restrictions

### tRPC Setup (App Router)

- Server: `fetchRequestHandler` in `apps/web/app/api/trpc/[trpc]/route.ts`
- Client: `createTRPCReact<AppRouter>()` in `apps/web/lib/trpc.ts`, wired through `<Providers>` in `apps/web/components/providers.tsx`
- Context: `createTRPCContext` in `packages/api/src/trpc.ts` (uses `getServerSession`)

### NextAuth Setup

- Config: `packages/auth/src/index.ts` — exports `authOptions`
- Route: `apps/web/app/api/auth/[...nextauth]/route.ts`
- Strategy: JWT (session stored client-side); user `id` and `plan` embedded in token

### Design System

All UI uses the dark **Obsidian Momentum** theme from `apps/web/app/globals.css`:
- `--flame: #FF6B1A` / `--flame-2: #FF3D68` — primary accent gradient
- `--bg: #09090C`, `--surface: #111116`, `--surface-2: #17171E`, `--surface-3: #1E1E28`
- Font stack: `Fraunces` (streak numbers, italic display), `DM Mono` (data/counters), `Outfit` (UI)
- Tailwind custom tokens defined in `packages/config/tailwind.config.js`

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, etc.
