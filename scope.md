# StreakFlow — Project Scope & Phased Roadmap

**Version:** 1.0  
**Status:** Approved for MVP development  
**Last Updated:** 2025

---

## Table of Contents

1. [Scope Philosophy](#1-scope-philosophy)
2. [Out of Scope (Permanently)](#2-out-of-scope-permanently)
3. [MVP Definition](#3-mvp-definition)
4. [Phase 1 — MVP (Weeks 1–12)](#4-phase-1--mvp-weeks-112)
5. [Phase 2 — Growth (Weeks 13–24)](#5-phase-2--growth-weeks-1324)
6. [Phase 3 — Premium Differentiators (Weeks 25–40)](#6-phase-3--premium-differentiators-weeks-2540)
7. [Phase 4 — Scale & Ecosystem (Weeks 41+)](#7-phase-4--scale--ecosystem-weeks-41)
8. [Premium Considerations](#8-premium-considerations)
9. [Risk Register](#9-risk-register)
10. [Deliverables Checklist](#10-deliverables-checklist)
11. [Project Scaffold](#11-project-scaffold)

---

## 1. Scope Philosophy

StreakFlow follows a **ruthless MVP discipline**: nothing ships in Phase 1 that is not required to validate the core loop of *create habit → complete daily → see streak grow*. Every feature proposed for the MVP must pass the following three gates before it is included:

1. **Retention gate:** Does this feature increase the probability a user returns tomorrow?
2. **Conversion gate:** Does this feature, or its absence, affect whether a free user upgrades?
3. **Complexity gate:** Can this feature be removed later without a database migration?

If a feature fails all three gates, it moves to Phase 2 or later.

**Guiding constraint:** The MVP must be shippable by a team of 2 engineers + 1 designer within 12 weeks. Every week of scope added costs a week of learning delayed.

---

## 2. Out of Scope (Permanently)

The following are explicitly not planned at any phase to keep StreakFlow focused:

- Native mobile apps (iOS/Android) — web PWA covers mobile use cases in MVP; native apps only if DAU > 100K
- AI/LLM habit suggestions — adds LLM cost and latency; may be revisited as a Phase 5 experiment
- Time tracking / pomodoro timer built-in — scope creep; integrations preferred
- Project management (milestones, dependencies, Gantt charts) — different product category
- Social feed / public profiles — privacy risk, moderation burden
- Marketplace / template library — too early without community
- Desktop native app (Electron/Tauri) — web app + PWA sufficient at this scale
- SMS/push notifications via platform — email + in-app preferred; adds TCPA compliance burden

---

## 3. MVP Definition

The MVP is the smallest releasable product that validates the core thesis: **people will pay for a habit tracker that makes streak consistency feel real and rewarding.**

### MVP must-haves (non-negotiable)

- [ ] Email + OAuth authentication (Google, GitHub)
- [ ] Create, edit, complete, and delete daily tasks
- [ ] Create, edit, archive, and delete habits
- [ ] Streak tracking with accurate timezone handling
- [ ] Streak calendar (30-day heatmap)
- [ ] Streak milestone celebrations (7, 30, 100 days)
- [ ] Free vs Pro tier gating (enforced server-side)
- [ ] Stripe checkout and webhook handling
- [ ] 14-day free Pro trial
- [ ] Basic analytics: completion rate, weekly summary
- [ ] Offline task creation and completion (sync on reconnect)
- [ ] Keyboard accessibility (WCAG 2.1 AA minimum)
- [ ] Dark mode
- [ ] Responsive design (mobile + desktop)
- [ ] Email notifications (milestone, trial expiry)

### MVP nice-to-haves (include if schedule permits)

- [ ] Routine groups (ordered habit collections)
- [ ] Subtasks (one level of nesting)
- [ ] Command palette (Cmd+K)
- [ ] Task auto-rollover toggle

### MVP definitely-not (move to Phase 2)

- Collaboration / shared spaces
- Full analytics dashboard (widget grid, correlation matrix)
- CSV/JSON export
- API access for users
- Streak freeze tokens
- Custom habit colours (beyond palette)
- Routine timer
- Integrations (Google Calendar, Apple Health, Zapier)

---

## 4. Phase 1 — MVP (Weeks 1–12)

### Sprint breakdown

| Sprint | Weeks | Focus |
|---|---|---|
| 0 | 1 | Project setup: monorepo, CI, DB schema, auth skeleton |
| 1 | 2–3 | Task CRUD + daily task view (core loop) |
| 2 | 4–5 | Habit CRUD + streak engine + heatmap |
| 3 | 6–7 | Offline support (Service Worker + Dexie + sync queue) |
| 4 | 8–9 | Premium gating + Stripe integration + trial |
| 5 | 10 | Analytics basics + email notifications |
| 6 | 11 | Keyboard accessibility + a11y audit |
| 7 | 12 | Bug bash + performance budget + soft launch |

### Phase 1 acceptance criteria

The MVP is considered complete when all of the following are true:

- [ ] A new user can sign up, create a habit, complete it for 3 consecutive days, and see a streak of 3 — in under 5 minutes
- [ ] A free user attempting to create a 6th habit sees an upgrade prompt and can complete checkout in under 2 minutes
- [ ] The app passes Lighthouse CI with LCP < 2.5s, CLS < 0.1
- [ ] The app passes axe-core with 0 critical/serious violations
- [ ] All keyboard shortcuts listed in the spec are functional
- [ ] Offline mode: creating a task while in airplane mode and syncing on reconnect works end-to-end in E2E test
- [ ] Stripe test checkout and webhook processing is verified in staging
- [ ] GDPR data export and deletion flows are implemented and tested
- [ ] The app is deployed to production at streakflow.app

### Phase 1 deliverables

- Deployed web application
- PostgreSQL schema with migrations
- tRPC API with full test coverage
- GitHub Actions CI pipeline (lint, test, build, deploy)
- Sentry error tracking active
- PostHog analytics active
- Stripe Pro monthly + annual plans live
- `README.md`, `specifications.md`, `scope.md` committed to repository
- Onboarding checklist for new engineers (`CONTRIBUTING.md`)

---

## 5. Phase 2 — Growth (Weeks 13–24)

Phase 2 is driven by learning from the MVP launch. The features below are planned but will be reprioritised based on user feedback, support ticket themes, and analytics data.

### Planned features

**Collaboration (Shared Spaces)**
- Create spaces, invite members via email or link
- Space habits visible to all members
- Activity feed (7-day rolling)
- Required for Team tier positioning

**Streak Freeze Tokens**
- Free: 1/month, Pro: 3/month, Team: 5/seat/month
- UI to apply freeze retrospectively for the previous day only
- Abuse prevention: freeze cannot be applied more than 24 hours after the missed day

**Advanced Analytics**
- Draggable/resizable widget dashboard (Pro)
- 30-day rolling average trend lines
- Best day of week per habit
- CSV + JSON export

**Routine Management**
- Routine timer (Pro)
- Routine history and completion rates
- Quick-complete all routine habits in one tap

**Command Palette (Cmd+K)**
- Fuzzy search tasks, habits, navigation
- Action shortcuts (create task, complete habit)
- If not shipped in Phase 1

**Progressive Web App (PWA) Enhancements**
- Add to Home Screen prompt (mobile)
- Background sync improvements
- Push notification opt-in (Web Push API) — streak reminders

**Integrations — Tier 1**
- Google Calendar: task due dates sync as calendar events
- Zapier webhook trigger: habit completed

### Phase 2 acceptance criteria

- Team tier checkout and seat management live in production
- Shared space E2E test passing
- Push notification opt-in rate > 20% of mobile users
- Zapier integration live in Zapier directory
- Net Promoter Score survey deployed (triggered at 30 days active)

### Phase 2 success metrics

| Metric | Target |
|---|---|
| MAU | 10,000 |
| Pro conversion rate | 6% |
| Team plan accounts | 200 |
| Day-60 retention | 30% |

---

## 6. Phase 3 — Premium Differentiators (Weeks 25–40)

Phase 3 deepens the value of Pro and Team tiers to reduce churn and increase ARPU.

### Planned features

**Deep Analytics (Pro)**
- Habit correlation matrix (which habits co-occur most)
- Time-of-day completion heatmap
- Productivity score (composite metric, user-configurable weighting)
- Personal records timeline (visual history of all PRs)
- Read-only personal API (OAuth 2.0 token, JSON endpoints)

**Team Admin Controls (Team)**
- Member management dashboard (roles, remove, transfer ownership)
- Space-level analytics (aggregate completion rates)
- Streak leaderboard with historical snapshots
- SSO (SAML 2.0) — for enterprise teams (Phase 3.5)

**Habit Stacking Visualiser**
- Drag habits into a "stack" that must be completed in order
- Progress indicator that auto-advances as habits are completed
- Stack-level streak separate from individual habit streaks

**Integrations — Tier 2**
- Apple Health / Google Fit: sync active minutes to habit completions
- Notion: embed StreakFlow widget in Notion pages
- Slack: `/streak` command to post today's progress to a channel
- Webhooks (generic): POST on habit completed, streak broken

**Mobile PWA Hardening**
- Reliable offline edit of habit metadata (not just completions)
- Share Streak Card: generate a shareable image of your streak calendar (social share)

### Phase 3 acceptance criteria

- API access used by > 5% of Pro users within 60 days of launch
- Slack integration installed in > 100 workspaces within 30 days
- SSO available for Team enterprise contracts > $500/month

### Phase 3 success metrics

| Metric | Target |
|---|---|
| MAU | 30,000 |
| Pro conversion rate | 8% |
| ARPU (Pro) | $65/year |
| Annual plan mix | 40% of paid |
| Churn (monthly) | < 3% |

---

## 7. Phase 4 — Scale & Ecosystem (Weeks 41+)

Phase 4 is contingent on achieving Phase 3 targets. Scope is intentionally loose.

### Candidate features (to be scoped based on data)

- ClickHouse migration for analytics queries (triggered at 1M events/day)
- Public habit template library (community-contributed)
- "Challenges" — time-limited community streak events
- Native iOS and Android apps (if PWA engagement signals warrant it)
- White-label / reseller programme
- Enterprise contracts with SLA, custom SSO, data residency
- AI habit recommendations (based on user's own historical pattern, not generic)
- Habit journalling — freeform daily notes attached to habit completions

---

## 8. Premium Considerations

### Conversion Strategy

**Free tier is a showcase, not a limitation.** The free tier is designed to give users a complete taste of the core loop — create habits, build streaks — without artificial friction. The 5-habit limit is the primary conversion driver because it is hit naturally by engaged users (not immediately on signup).

**Upgrade prompt principles:**
1. Show the prompt in context — if a user hits the habit limit, show them the upgrade prompt on that exact screen
2. Explain the specific value — "Unlock unlimited habits, 12-month heatmap, and advanced analytics"
3. Never show the same prompt twice in one session
4. Never show a paywall without a "not now" option
5. Trial conversion email sequence is automated and non-spammy (max 5 emails over 14 days)

### Churn Reduction

- **Cancellation survey:** 3-question exit survey before confirming cancellation. Options: "Too expensive", "Not using it enough", "Missing a feature", "Found a better tool", "Other". Routes to targeted retention offers.
- **Pause option:** Users who select "not using it enough" are offered a 1-month pause (Pro features retained, no charge) before full cancellation.
- **Win-back campaign:** 30 days after cancellation, send a re-engagement email with any new features shipped since cancellation.

### Pricing Sensitivity

The $7/month Pro price is positioned below the "daily coffee" psychological anchor ($5–$10/day). Annual billing at $60/year (~$5/month) is the target mix. Key pricing decisions to validate in Phase 1:

- A/B test $7/month vs $9/month in Month 2 of launch
- Test annual-first vs monthly-first checkout presentation
- Consider a "Lifetime" plan ($149 one-time) as a limited launch offer

### Enterprise Path (Phase 3+)

Enterprise contracts (> $200/month) require:
- Dedicated Slack channel for support
- Custom SLA (99.95% uptime)
- SOC 2 Type II compliance (targeted for end of Phase 3)
- SAML SSO
- Custom data retention policies
- Invoice-based billing (no credit card required)

---

## 9. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Streak calculation bugs (timezone edge cases) | High | High | Extensive unit tests; DST-specific test cases; server-side recalculation nightly |
| Stripe webhook delivery failure | Medium | High | Idempotency keys; retry logic; webhook signature verification; monitoring |
| Offline sync conflicts corrupt data | Medium | High | Last-write-wins with server authority on streaks; conflict log visible to user |
| Low free-to-paid conversion (<3%) | Medium | High | A/B test pricing; improve upgrade prompt copy; extend trial to 21 days |
| Performance regression on analytics page | Medium | Medium | Lighthouse CI budget enforcement; DB query explain plans reviewed before merge |
| GDPR non-compliance | Low | Critical | Legal review of privacy policy; DPA with Vercel/Neon/Upstash; data residency for EU (Phase 3) |
| Key engineer departure | Low | High | Documentation-first culture; pair programming on critical systems; runbook for all jobs |
| Competitor launches similar product | Medium | Medium | Speed to market; focus on quality of streak UX; differentiate on analytics depth |

---

## 10. Deliverables Checklist

### Documentation

- [ ] `README.md` — project overview, setup, run, build, license
- [ ] `specifications.md` — feature specs, acceptance criteria, data models, API contracts
- [ ] `scope.md` — this document
- [ ] `CONTRIBUTING.md` — developer onboarding, code style, PR process
- [ ] `CHANGELOG.md` — kept current from first release
- [ ] `docs/architecture.md` — detailed architecture diagrams (Mermaid)
- [ ] `docs/runbooks/` — operational runbooks for: deploy, rollback, DB migration, incident response

### Engineering

- [ ] Turborepo monorepo scaffold (`apps/web`, `apps/worker`, `packages/*`)
- [ ] Prisma schema with all MVP models and initial migration
- [ ] NextAuth.js configured (Google OAuth + magic link)
- [ ] tRPC router with all MVP endpoints
- [ ] Zod input schemas for all tRPC procedures
- [ ] Streak calculation engine (pure function, fully tested)
- [ ] Timezone-correct streak boundary worker (BullMQ job)
- [ ] Service Worker (Workbox) with offline shell caching
- [ ] IndexedDB sync layer (Dexie.js) with mutation queue
- [ ] Stripe checkout + webhook handler + subscription sync
- [ ] Feature flag middleware (Unleash)
- [ ] Email templates (React Email): welcome, milestone, trial expiry, digest
- [ ] GDPR: export endpoint, deletion endpoint, consent recording

### Design

- [ ] Figma component library published (shared with engineering team)
- [ ] Logo SVG (light + dark variants, favicon)
- [ ] Design tokens exported as CSS custom properties
- [ ] Responsive layouts: mobile (375px), tablet (768px), desktop (1280px)
- [ ] Onboarding flow (empty state → first habit → first completion)
- [ ] Dark mode for all screens
- [ ] Streak celebration animation assets (Lottie JSON)

### Infrastructure

- [ ] Vercel project configured (production + preview environments)
- [ ] Fly.io worker app configured with health checks
- [ ] Neon Postgres configured (production + staging + development branches)
- [ ] Upstash Redis configured
- [ ] Cloudflare R2 bucket configured
- [ ] Sentry projects configured (web + worker)
- [ ] PostHog project configured
- [ ] GitHub Actions CI pipeline (lint, test, build, e2e, lighthouse, deploy)
- [ ] Dependabot configured for dependency updates
- [ ] Secret rotation runbook documented

### Legal & Compliance

- [ ] Privacy Policy (GDPR + CCPA compliant, reviewed by counsel)
- [ ] Terms of Service
- [ ] Cookie consent banner (EU users)
- [ ] Data Processing Agreement with sub-processors (Vercel, Neon, Stripe, PostHog)
- [ ] `SECURITY.md` with responsible disclosure policy

---

## 11. Project Scaffold

The following is the recommended initial scaffold to create after cloning the repository. Run the setup script or create manually.

```
streakflow/
│
├── apps/
│   ├── web/                            # Next.js 14 (App Router)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── sign-in/page.tsx
│   │   │   │   └── sign-up/page.tsx
│   │   │   ├── (app)/
│   │   │   │   ├── layout.tsx          # Authenticated shell (sidebar, nav)
│   │   │   │   ├── today/page.tsx      # Daily task view (home)
│   │   │   │   ├── habits/
│   │   │   │   │   ├── page.tsx        # Habit list
│   │   │   │   │   └── [id]/page.tsx   # Habit detail + heatmap
│   │   │   │   ├── analytics/page.tsx  # Analytics dashboard
│   │   │   │   ├── routines/page.tsx   # Routines list
│   │   │   │   └── settings/
│   │   │   │       ├── page.tsx        # General settings
│   │   │   │       ├── billing/page.tsx
│   │   │   │       └── account/page.tsx
│   │   │   ├── api/
│   │   │   │   ├── trpc/[trpc]/route.ts
│   │   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   │   └── webhooks/stripe/route.ts
│   │   │   ├── layout.tsx              # Root layout (fonts, providers)
│   │   │   └── page.tsx                # Landing page (unauthenticated)
│   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── tasks/
│   │   │   │   │   ├── TaskList.tsx
│   │   │   │   │   ├── TaskItem.tsx
│   │   │   │   │   └── TaskCreateInput.tsx
│   │   │   │   ├── habits/
│   │   │   │   │   ├── HabitCard.tsx
│   │   │   │   │   ├── HabitGrid.tsx
│   │   │   │   │   ├── StreakBadge.tsx
│   │   │   │   │   ├── StreakHeatmap.tsx
│   │   │   │   │   └── StreakCelebration.tsx
│   │   │   │   ├── analytics/
│   │   │   │   │   ├── WeeklySummary.tsx
│   │   │   │   │   └── HabitTrendChart.tsx
│   │   │   │   └── billing/
│   │   │   │       ├── UpgradePrompt.tsx
│   │   │   │       └── PricingTable.tsx
│   │   │   └── shared/
│   │   │       ├── CommandPalette.tsx
│   │   │       ├── OfflineBanner.tsx
│   │   │       ├── ThemeToggle.tsx
│   │   │       └── KeyboardShortcutDialog.tsx
│   │   ├── hooks/
│   │   │   ├── useOfflineSync.ts
│   │   │   ├── useStreak.ts
│   │   │   └── useKeyboardShortcuts.ts
│   │   ├── lib/
│   │   │   ├── streak.ts               # Pure streak calculation functions
│   │   │   ├── timezone.ts             # Timezone utilities
│   │   │   ├── recurrence.ts           # Recurring task expansion
│   │   │   ├── analytics.ts            # PostHog event helpers
│   │   │   └── featureFlags.ts         # Unleash client
│   │   ├── stores/
│   │   │   ├── taskStore.ts            # Zustand: task state
│   │   │   ├── habitStore.ts           # Zustand: habit state
│   │   │   └── uiStore.ts              # Zustand: modals, panels, theme
│   │   ├── styles/
│   │   │   ├── globals.css             # CSS custom properties, resets
│   │   │   └── animations.css          # Streak flame, confetti keyframes
│   │   ├── public/
│   │   │   ├── icons/                  # PWA icons (192, 512)
│   │   │   ├── manifest.json           # PWA manifest
│   │   │   └── sw.js                   # Service Worker entry (Workbox inject)
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── worker/                         # BullMQ background processor
│       ├── jobs/
│       │   ├── streakRecalculation.ts  # Nightly per-timezone streak check
│       │   ├── dailyDigestEmail.ts     # Morning summary email
│       │   ├── trialExpiryReminder.ts  # 3-day + day-of trial reminder
│       │   └── dataExport.ts           # CSV/JSON export generation
│       ├── queues/
│       │   ├── streakQueue.ts
│       │   ├── emailQueue.ts
│       │   └── exportQueue.ts
│       ├── index.ts                    # Worker entry point
│       └── tsconfig.json
│
├── packages/
│   ├── db/                             # Prisma
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── index.ts                    # Re-export PrismaClient
│   ├── api/                            # tRPC routers
│   │   ├── routers/
│   │   │   ├── tasks.ts
│   │   │   ├── habits.ts
│   │   │   ├── streaks.ts
│   │   │   ├── analytics.ts
│   │   │   ├── subscriptions.ts
│   │   │   ├── spaces.ts
│   │   │   └── users.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts                 # Session validation
│   │   │   └── premium.ts             # Tier gate enforcement
│   │   ├── context.ts                  # tRPC context (session, db, redis)
│   │   └── root.ts                     # Root router combining all sub-routers
│   ├── auth/
│   │   ├── config.ts                   # NextAuth config
│   │   └── adapter.ts                  # Prisma adapter
│   ├── ui/                             # Shared Radix + Tailwind components
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Tooltip.tsx
│   │   └── index.ts
│   ├── config/
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   └── types/
│       ├── habit.ts
│       ├── task.ts
│       ├── streak.ts
│       └── subscription.ts
│
├── docs/
│   ├── architecture.md
│   ├── runbooks/
│   │   ├── deploy.md
│   │   ├── rollback.md
│   │   ├── db-migration.md
│   │   └── incident-response.md
│   └── assets/
│
├── docker/
│   ├── compose.dev.yml                 # Local Postgres + Redis + Mailhog
│   ├── Dockerfile.worker               # Worker image
│   └── Dockerfile.production           # Production web image (optional)
│
├── scripts/
│   ├── setup.sh                        # Initial dev environment setup
│   └── seed-demo.ts                    # Rich demo data for staging
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                      # Lint, test, build
│   │   ├── e2e.yml                     # Playwright E2E
│   │   └── deploy.yml                  # Production deploy
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── .env.example
├── .gitignore
├── .eslintrc.js                        # Root ESLint config
├── .prettierrc
├── turbo.json                          # Turborepo pipeline definition
├── package.json                        # Root workspace (private: true)
├── CONTRIBUTING.md
├── CHANGELOG.md
├── SECURITY.md
├── LICENSE
├── README.md
├── specifications.md
└── scope.md
```

### Initial `turbo.json` pipeline

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

### Recommended first-week engineer checklist

When a new engineer joins the project, they should be able to:

1. Clone the repo and run `npm install` — no manual steps
2. Run `docker compose -f docker/compose.dev.yml up -d` to start local infrastructure
3. Copy `.env.example` to `.env.local`, fill in 3 values (DB URL, Redis URL, NextAuth secret)
4. Run `npm run db:migrate && npm run db:seed` to bootstrap their database
5. Run `npm run dev` and see a working application at `localhost:3000`
6. Run `npm test` and see all tests pass
7. Run `npm run test:e2e` and see critical flows pass

Total time from clone to working app: under 15 minutes.

---

*This document is a living specification. All scope changes must be reviewed against the Phase 1 acceptance criteria before being merged into this document. Changes to Phase 1 MVP scope require sign-off from the product lead and both engineers.*
