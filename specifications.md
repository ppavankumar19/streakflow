# StreakFlow — Product Specifications

**Version:** 1.0  
**Status:** Draft — under review  
**Last Updated:** 2025

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Target Users & Personas](#2-target-users--personas)
3. [Core Feature Specifications](#3-core-feature-specifications)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Technical Stack](#5-technical-stack)
6. [Architecture Overview](#6-architecture-overview)
7. [Data Models](#7-data-models)
8. [API Contracts](#8-api-contracts)
9. [Premium Subscription Model](#9-premium-subscription-model)
10. [UI/UX Guidelines & Branding](#10-uiux-guidelines--branding)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment, CI/CD & Monitoring](#12-deployment-cicd--monitoring)
13. [Analytics Events](#13-analytics-events)
14. [Accessibility & Internationalisation](#14-accessibility--internationalisation)

---

## 1. Product Vision

StreakFlow is a **premium habit-and-task management platform** that combines the simplicity of a daily to-do list with the motivational power of streak-based consistency tracking. Unlike generalised productivity tools, StreakFlow is purpose-built around the psychology of habit formation: it rewards consistency, visualises progress, and makes the cost of breaking a chain visceral.

**Mission statement:** *Help individuals and teams build lasting habits by making consistency visible, rewarding, and inevitable.*

**Success metrics (12-month targets):**

| Metric | Target |
|---|---|
| Monthly Active Users (MAU) | 50,000 |
| Paid conversion rate (free → premium) | 8% |
| Day-30 retention | 40% |
| Average tasks completed per active user/day | 5+ |
| NPS score | 45+ |

---

## 2. Target Users & Personas

### Persona A — The Disciplined Professional
- **Who:** 25–40, knowledge worker, remote or hybrid
- **Goals:** Maintain exercise, reading, and deep-work routines alongside project tasks
- **Pain points:** Context-switching between habit apps and task apps; losing streaks during travel
- **Willingness to pay:** High — will upgrade for analytics and offline support

### Persona B — The Student
- **Who:** 18–25, university student or recent graduate
- **Goals:** Build study habits, track assignment deadlines, maintain health routines
- **Pain points:** Free apps lack accountability; habit stacking is hard to visualise
- **Willingness to pay:** Medium — likely to use free tier; converts during exam season

### Persona C — The Accountability Team
- **Who:** Small team (2–5 people), wellness group, or accountability partnership
- **Goals:** Shared habit goals, visible mutual progress, light-touch coordination
- **Pain points:** No existing tool combines tasks + habits for small groups without enterprise overhead
- **Willingness to pay:** High — team plan per seat

### Persona D — The Optimizer
- **Who:** 28–45, quantified-self enthusiast
- **Goals:** Rich analytics, export to CSV/JSON, integration with health apps
- **Pain points:** Shallow dashboards in consumer habit apps
- **Willingness to pay:** Very high — will pay for Pro tier primarily for analytics depth

---

## 3. Core Feature Specifications

---

### 3.1 Daily Task List

**Summary:** A focused, time-boxed list of tasks the user intends to complete today.

**Behaviour:**

- Each day begins with a fresh "Today" view. Incomplete tasks from the previous day roll over automatically (configurable: auto-rollover on/off).
- Tasks have a title (required, max 200 chars), optional note (max 2,000 chars), optional due time, priority level (none/low/medium/high), and an optional associated Habit.
- Tasks can be reordered via drag-and-drop and keyboard (Alt+Arrow).
- Completing a task triggers a micro-animation (confetti burst for the last task of the day).
- Tasks support recurring schedules (daily, weekdays, custom days of week, interval-based).
- Subtasks supported up to one level of nesting (no infinite nesting in MVP).

**Acceptance criteria:**

- [ ] User can create a task in under 3 keypresses (type title + Enter)
- [ ] Task completion is reflected in streak count within 500ms
- [ ] Reordering via keyboard (Alt+Up, Alt+Down) works without a mouse
- [ ] Auto-rollover respects user timezone, never rolls over tasks on the same calendar day
- [ ] Recurring tasks regenerate at midnight in the user's local timezone
- [ ] Completing a task while offline is queued and synced on reconnect
- [ ] Task creation triggers `task_created` analytics event

---

### 3.2 Streak Tracking

**Summary:** A streak is a consecutive-day count for a Habit. It is the emotional core of StreakFlow.

**Streak calculation rules:**

1. A habit is "completed" for a day if at least one associated task was marked done, or if the habit was directly checked off, before midnight in the user's local timezone.
2. The streak increments at midnight if the previous day was completed.
3. Missing a day resets the streak to 0. A "freeze" token (see 3.6) can protect a streak from one missed day.
4. Streaks persist across timezone changes — the day is anchored to the timezone at task-completion time.
5. A "longest streak" (personal record) is tracked separately and never decrements.

**Visual representation:**

- Current streak badge on habit cards (flame icon + number)
- Streak calendar — a GitHub-contribution-style heatmap showing completion intensity per day for the trailing 12 months (free: 30 days, Pro: unlimited history)
- Streak milestones trigger a celebration modal at 7, 14, 30, 60, 100, 365 days

**Acceptance criteria:**

- [ ] Streak count is accurate to user local timezone, not server UTC
- [ ] Streak reset does not delete task history
- [ ] Personal record badge updates in real time when a new PR is set
- [ ] Heatmap renders correctly for users with DST transitions
- [ ] Freeze token deduction happens once per missed day, never twice

---

### 3.3 Habit & Routine Management

**Summary:** A Habit is a recurring intention the user wants to build. It lives above individual tasks.

**Habit object properties:**

- Name (required, max 100 chars)
- Description (optional, max 500 chars)
- Icon (emoji selector, 1 character)
- Colour (palette of 20 preset colours + custom hex for Pro)
- Frequency target (1–7 days per week, or daily interval e.g. every 2 days)
- Time of day preference (morning / afternoon / evening / anytime)
- Category (custom tags, searchable)
- Associated tasks (many-to-many)
- Start date
- Archive status (archived habits are hidden but data is preserved)

**Routines:** A Routine is an ordered collection of Habits that are intended to be done together. Examples: "Morning Routine", "Pre-sleep Wind-down". Completing a Routine completes all child Habits for the day. A routine timer (free: off, Pro: on) shows elapsed time while you work through it.

**Acceptance criteria:**

- [ ] Archiving a habit preserves all streak and task history
- [ ] Habit frequency target is visualised in the weekly overview
- [ ] Completing a routine marks all child habits without requiring individual taps
- [ ] Routine timer is paused/resumed and not lost on navigation
- [ ] Habits can be reordered within a routine via drag-and-drop
- [ ] Deleting a habit requires two-step confirmation and explains data impact

---

### 3.4 Analytics & Dashboard

**Summary:** Data visualisations helping users understand their productivity and habit health.

**Free tier analytics (30-day window):**

- Completion rate per habit (percentage of days target was met)
- Weekly summary card (tasks done, habits hit, streaks maintained)
- Best day of week for each habit

**Pro analytics (unlimited history):**

- Trend lines (7-day rolling average, 30-day rolling average)
- Habit correlation matrix — which habits are completed together most often
- Time-of-day completion heatmap per habit
- Productivity score (composite metric, configurable weighting)
- Export to CSV / JSON (full history)
- API access to personal data (read-only OAuth token)

**Dashboard layout:**

- Today panel (priority: tasks due today, habits to hit)
- Streak leaderboard (collaborative feature — shared spaces only)
- Widget grid (Pro: draggable, resizable, persistent layout)

**Acceptance criteria:**

- [ ] Analytics page loads in under 2 seconds on a 4G connection
- [ ] CSV export contains all task and habit completion records, including timestamps
- [ ] Correlation matrix is hidden/disabled for users with fewer than 14 days of data
- [ ] Productivity score formula is documented and user-visible (no black box)

---

### 3.5 Offline Support

**Summary:** StreakFlow must function fully without a network connection.

**Architecture:**

- Service Worker (Workbox) caches the application shell and static assets
- IndexedDB (via Dexie.js) stores all tasks and habits locally
- A background sync queue holds mutations (create/update/delete/complete) while offline
- On reconnection, mutations are replayed in order against the server API
- Conflict resolution: last-write-wins on individual fields; server wins on streak counts

**User-facing indicators:**

- Offline banner with status indicator (yellow dot → "Working offline")
- Sync in progress indicator (spinner in nav)
- Sync error toast with retry button if a conflict cannot be resolved automatically

**Acceptance criteria:**

- [ ] User can create, complete, and reorder tasks with no network connection
- [ ] Completing a habit offline is reflected in the streak on next sync
- [ ] The app correctly handles the case where a day rolls over while the user is offline
- [ ] Sync queue is durable — persists across browser/app restarts
- [ ] Offline mode is announced to screen readers via ARIA live region

---

### 3.6 Premium Feature Gating

**Summary:** Features are gated by subscription tier. Gates are enforced on both client and server.

| Feature | Free | Pro | Team |
|---|---|---|---|
| Habits | Up to 5 | Unlimited | Unlimited |
| Analytics history | 30 days | Unlimited | Unlimited |
| Heatmap history | 30 days | 12 months | 12 months |
| Streak freeze tokens | 1/month | 3/month | 5/seat/month |
| Custom habit colours | ❌ | ✅ | ✅ |
| Routine timer | ❌ | ✅ | ✅ |
| Widget dashboard | ❌ | ✅ | ✅ |
| CSV/JSON export | ❌ | ✅ | ✅ |
| API access | ❌ | ✅ | ✅ |
| Shared spaces | ❌ | 1 space (5 members) | Unlimited spaces |
| Streak leaderboard | ❌ | ❌ | ✅ |
| Admin controls | ❌ | ❌ | ✅ |
| Priority support | ❌ | ✅ | ✅ |

**Gate enforcement rules:**

- UI gates show a contextual upgrade prompt (not a generic paywall) explaining specifically why the feature is locked
- Server-side gates are enforced at the API layer regardless of client state
- Feature flags (via Unleash) allow specific users or cohorts to access gated features for A/B testing or trials

**Trial:** All new accounts receive a 14-day Pro trial automatically. No credit card required for trial.

**Acceptance criteria:**

- [ ] Attempting to create a 6th habit on free tier shows upgrade prompt, does not silently fail
- [ ] Downgrading from Pro to Free hides Pro features but does not delete data
- [ ] Stripe webhook processes subscription changes within 30 seconds
- [ ] Feature flag overrides work correctly in staging environment
- [ ] Trial expiry sends an email notification 3 days before and on the day of expiry

---

### 3.7 Collaboration Features

**Summary:** Shared Spaces allow teams or accountability groups to share habits and view each other's progress.

**Shared Space features:**

- Create a space, invite members via email or shareable link
- Each member sees their own habit list + a shared habits panel
- "Space habits" are habits all members have committed to tracking
- Leaderboard showing current streaks per member for each space habit (Team tier only)
- Activity feed (last 7 days of completions across members)
- Admin can remove members, archive the space, or transfer ownership

**Privacy controls:**

- Members can mark personal habits as "private" — not visible to space members
- Admins cannot see members' private habits
- Full data deletion on member removal (space data dissociated, not deleted)

**Acceptance criteria:**

- [ ] Invite link expires after 7 days or after 10 uses, whichever comes first
- [ ] Removing a member removes their data from the space view within 1 hour
- [ ] Leaderboard updates in near-real-time (within 60 seconds of a completion)
- [ ] Activity feed is paginated and loads older items on scroll
- [ ] Space creation is restricted to Pro and Team tier users

---

### 3.8 Keyboard Accessibility & Power User Features

**Summary:** StreakFlow must be fully operable via keyboard, and power users should be able to perform all common actions without touching a mouse.

**Global keyboard shortcuts:**

| Shortcut | Action |
|---|---|
| `N` | New task (anywhere outside an input) |
| `H` | New habit |
| `Cmd/Ctrl + K` | Command palette |
| `T` | Jump to Today view |
| `G then H` | Go to Habits |
| `G then A` | Go to Analytics |
| `G then S` | Go to Settings |
| `Escape` | Dismiss modal / clear selection |
| `Alt + ↑ / ↓` | Reorder selected task |
| `Space` | Toggle completion on focused task |
| `?` | Open keyboard shortcut reference |

**Command palette (Cmd+K):**

- Fuzzy search over all tasks, habits, and navigation destinations
- Supports actions: create task, complete habit, navigate to date, toggle dark mode
- Recent items shown when palette opens with no query

**Acceptance criteria:**

- [ ] All interactive elements have a visible focus indicator (3px outline, meets WCAG 2.1 AA)
- [ ] Tab order is logical and matches visual order
- [ ] Command palette is reachable via keyboard alone
- [ ] Drag-and-drop reordering has a keyboard alternative
- [ ] Shortcut reference dialog is reachable via keyboard and screen reader

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Target |
|---|---|
| First Contentful Paint (FCP) | < 1.2s on 4G |
| Largest Contentful Paint (LCP) | < 2.5s on 4G |
| Time to Interactive (TTI) | < 3.5s on 4G |
| Interaction to Next Paint (INP) | < 200ms |
| API p95 latency | < 300ms |
| API p99 latency | < 1,000ms |
| Offline task create round-trip | < 50ms (local only) |

### 4.2 Security

- All traffic over HTTPS/TLS 1.3+
- Passwords hashed with bcrypt (cost factor 12) — magic links and OAuth preferred
- JWT session tokens rotate on each use; refresh token stored in httpOnly cookie
- All API routes authenticated; premium routes verified server-side
- Input validation with Zod on all API inputs
- SQL injection prevention via parameterised queries (Prisma)
- XSS prevention via React's default escaping + strict CSP header
- CSRF protection on all mutating endpoints
- PII encrypted at rest in database (email, display name)
- GDPR/CCPA compliant: data export within 72 hours, account deletion within 30 days
- Rate limiting: 100 req/min per IP (unauthenticated), 500 req/min per user (authenticated)
- Secrets managed via environment variables; no secrets in source code

### 4.3 Reliability

- Target uptime: 99.9% (< 8.7 hours downtime per year)
- Zero-downtime deployments via rolling updates
- Database automated daily backups retained for 30 days
- Point-in-time recovery (PITR) to any 1-minute window within 7 days

### 4.4 Scalability

- Stateless API servers horizontally scalable behind a load balancer
- Database read replicas for analytics queries
- Redis for rate limiting, session caching, and queue management
- CDN for all static assets and API edge caching

### 4.5 Compliance

- GDPR (EU users): explicit consent for marketing, right to access, right to erasure
- CCPA (California users): opt-out of data sale (N/A — we do not sell data)
- WCAG 2.1 AA: all user-facing features meet minimum accessibility standard
- PCI DSS: no card data stored on our servers — handled entirely by Stripe

---

## 5. Technical Stack

### Frontend

| Choice | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR/SSG/ISR flexibility; edge runtime support; strong ecosystem |
| Language | TypeScript 5 | End-to-end type safety with shared types across monorepo |
| Styling | Tailwind CSS 3 | Utility-first; consistent design tokens; purge for small bundles |
| UI Primitives | Radix UI | Unstyled, fully accessible components (dialogs, dropdowns, popovers) |
| State (server) | TanStack Query v5 | Caching, background sync, optimistic updates |
| State (client) | Zustand | Lightweight; avoids Redux boilerplate for UI state |
| Forms | React Hook Form + Zod | Performant; shares validation schema with API |
| Animations | Framer Motion | Streak celebration animations; page transitions |
| Offline | Workbox + Dexie.js | Service worker management + typed IndexedDB |
| Charts | Recharts | Accessible, composable, React-native |
| Drag & Drop | @dnd-kit | Accessible drag-and-drop with keyboard support |
| Date handling | date-fns | Tree-shakeable; locale-aware |

### Backend

| Choice | Technology | Rationale |
|---|---|---|
| API layer | tRPC v11 | End-to-end type safety; shares types with frontend; no codegen step |
| ORM | Prisma 5 | Type-safe queries; excellent migration tooling; supports Postgres |
| Background jobs | BullMQ (Redis) | Reliable, distributed job queue for streak recalculation and emails |
| Email | Resend + React Email | Developer-friendly; React component email templates |
| File storage | Cloudflare R2 | S3-compatible; zero egress fees; globally distributed |
| Payments | Stripe | Industry standard; webhook reliability; strong Node.js SDK |
| Auth | NextAuth.js v5 | OAuth (Google, GitHub), magic links, JWT sessions |
| Feature flags | Unleash | Self-hostable; supports gradual rollouts and A/B testing |

### Database

| Choice | Technology | Rationale |
|---|---|---|
| Primary DB | PostgreSQL 15 | ACID transactions; JSON columns for flexible metadata; excellent tooling |
| Cache / Queue | Redis 7 | Low-latency reads; BullMQ dependency; rate limiting |
| Search | PostgreSQL full-text search (pg_trgm) | Avoids Elasticsearch complexity for MVP scale |
| Analytics DB | ClickHouse (Phase 2) | Columnar store for high-volume event analytics at scale |

### Infrastructure & Hosting

| Component | Choice | Rationale |
|---|---|---|
| App hosting | Vercel (web) | Zero-config Next.js; edge functions; built-in CDN |
| Worker hosting | Fly.io | Long-running Node.js processes; affordable; global regions |
| Database hosting | Neon (Postgres) | Serverless Postgres; branching for staging; affordable |
| Redis hosting | Upstash | Serverless Redis; per-request pricing; REST API for edge |
| Monitoring | Sentry (errors) + Grafana Cloud (metrics) | Complementary; Sentry for frontend/backend errors |
| Logging | Axiom | Structured logs; affordable at startup scale |
| CI/CD | GitHub Actions | Native to GitHub; wide ecosystem; Turborepo remote caching |

---

## 6. Architecture Overview

### High-Level Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                            │
│                                                                       │
│   Next.js App (React)  ←→  Service Worker  ←→  IndexedDB (Dexie)   │
│        ↕ tRPC                                                         │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │ HTTPS
                              ┌─────▼──────┐
                              │  Vercel     │
                              │  Edge CDN   │
                              └─────┬──────┘
                                    │
                         ┌──────────▼──────────┐
                         │   Next.js API Routes │
                         │   (tRPC handlers)    │
                         └──┬──────────────┬───┘
                            │              │
              ┌─────────────▼──┐    ┌──────▼──────────┐
              │   PostgreSQL   │    │   Redis          │
              │   (Neon)       │    │   (Upstash)      │
              └────────────────┘    └──┬──────────────┘
                                       │
                              ┌────────▼────────┐
                              │  BullMQ Worker  │
                              │  (Fly.io)        │
                              │                  │
                              │  - Streak calc   │
                              │  - Email digest  │
                              │  - Data export   │
                              └─────────────────┘
```

### Key Services

**API Service (Next.js API routes + tRPC):** Handles all CRUD operations, authentication, and premium gate enforcement. Stateless and horizontally scalable.

**Streak Calculation Worker:** Runs nightly at midnight per timezone bucket. Processes streak recalculation for all users whose day just ended. Publishes `streak_updated` events consumed by the notification service.

**Notification Worker:** Sends daily digest emails, streak milestone notifications, and trial expiry reminders. Rate-limited per user.

**Sync Engine (client):** Manages the offline queue in IndexedDB, applies optimistic updates to local state, and reconciles with the server on reconnect.

**Feature Flag Service (Unleash):** Evaluates feature flags per user context (tier, cohort, user ID). Flags evaluated server-side on API routes for security.

---

## 7. Data Models

All models are defined as Prisma schema entities. Key fields are described below.

### User

```
User {
  id            String    (ULID, primary key)
  email         String    (unique, encrypted at rest)
  displayName   String?
  avatarUrl     String?
  timezone      String    (IANA timezone, e.g. "America/New_York")
  locale        String    (BCP 47, e.g. "en-US")
  tier          Enum      (FREE | PRO | TEAM)
  trialEndsAt   DateTime?
  createdAt     DateTime
  updatedAt     DateTime
  
  habits        Habit[]
  tasks         Task[]
  sessions      Session[]
  subscription  Subscription?
  spaceMemberships SpaceMember[]
}
```

### Habit

```
Habit {
  id            String    (ULID)
  userId        String    (FK → User)
  name          String    (max 100)
  description   String?   (max 500)
  icon          String    (single emoji)
  colour        String    (hex)
  frequencyDays Int[]     (e.g. [1,2,3,4,5] = weekdays)
  timeOfDay     Enum      (MORNING | AFTERNOON | EVENING | ANYTIME)
  tags          String[]
  isArchived    Boolean   (default false)
  startDate     DateTime
  createdAt     DateTime
  updatedAt     DateTime
  
  tasks         Task[]
  completions   HabitCompletion[]
  routineItems  RoutineItem[]
}
```

### Task

```
Task {
  id            String    (ULID)
  userId        String    (FK → User)
  habitId       String?   (FK → Habit, optional)
  parentTaskId  String?   (FK → Task, for subtasks)
  title         String    (max 200)
  note          String?   (max 2000)
  dueDate       DateTime?
  dueTime       String?   (HH:MM local time)
  priority      Enum      (NONE | LOW | MEDIUM | HIGH)
  isCompleted   Boolean   (default false)
  completedAt   DateTime?
  isRecurring   Boolean   (default false)
  recurrence    Json?     (RRULE-style object)
  sortOrder     Int
  createdAt     DateTime
  updatedAt     DateTime
  
  subtasks      Task[]    (children via parentTaskId)
}
```

### HabitCompletion

```
HabitCompletion {
  id            String    (ULID)
  habitId       String    (FK → Habit)
  userId        String    (FK → User)
  completedDate Date      (YYYY-MM-DD in user local timezone)
  completedAt   DateTime  (UTC timestamp of actual completion)
  source        Enum      (MANUAL | TASK | ROUTINE)
  isFreezeUsed  Boolean   (default false)
  createdAt     DateTime
  
  UNIQUE(habitId, completedDate)
}
```

### Streak

```
Streak {
  id              String    (ULID)
  habitId         String    (FK → Habit, unique)
  currentStreak   Int       (default 0)
  longestStreak   Int       (default 0)
  lastCompletedDate Date?
  freezeTokens    Int       (default 0)
  updatedAt       DateTime
}
```

### Routine

```
Routine {
  id          String    (ULID)
  userId      String    (FK → User)
  name        String    (max 100)
  description String?
  sortOrder   Int
  createdAt   DateTime
  updatedAt   DateTime
  
  items       RoutineItem[]
}

RoutineItem {
  id          String    (ULID)
  routineId   String    (FK → Routine)
  habitId     String    (FK → Habit)
  sortOrder   Int
}
```

### Subscription

```
Subscription {
  id                    String    (ULID)
  userId                String    (FK → User, unique)
  stripeCustomerId      String    (unique)
  stripeSubscriptionId  String?   (unique)
  plan                  Enum      (FREE | PRO_MONTHLY | PRO_ANNUAL | TEAM_MONTHLY)
  status                Enum      (ACTIVE | PAST_DUE | CANCELED | TRIALING)
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  cancelAtPeriodEnd     Boolean   (default false)
  createdAt             DateTime
  updatedAt             DateTime
}
```

### Space (Collaboration)

```
Space {
  id          String    (ULID)
  name        String    (max 100)
  ownerId     String    (FK → User)
  inviteCode  String    (unique, 8-char random)
  inviteExpiresAt DateTime?
  createdAt   DateTime
  updatedAt   DateTime
  
  members     SpaceMember[]
  habits      SpaceHabit[]
}

SpaceMember {
  id          String    (ULID)
  spaceId     String    (FK → Space)
  userId      String    (FK → User)
  role        Enum      (OWNER | ADMIN | MEMBER)
  joinedAt    DateTime
  
  UNIQUE(spaceId, userId)
}
```

---

## 8. API Contracts

All endpoints are exposed via tRPC. HTTP equivalents are listed for reference (tRPC maps to POST by default).

### Tasks

```
tasks.list
  Input:  { date?: string (YYYY-MM-DD), habitId?: string, includeCompleted?: boolean }
  Output: Task[]

tasks.create
  Input:  { title, habitId?, dueDate?, dueTime?, priority?, note?, isRecurring?, recurrence? }
  Output: Task

tasks.update
  Input:  { id, title?, note?, priority?, dueDate?, dueTime?, sortOrder? }
  Output: Task

tasks.complete
  Input:  { id, completedAt?: string (ISO 8601) }
  Output: { task: Task, streakUpdated: boolean, newStreak?: number }

tasks.delete
  Input:  { id }
  Output: { success: true }
```

### Habits

```
habits.list
  Input:  { includeArchived?: boolean }
  Output: Habit[]

habits.create
  Input:  { name, icon?, colour?, frequencyDays?, timeOfDay?, tags?, description? }
  Output: Habit

habits.update
  Input:  { id, name?, icon?, colour?, frequencyDays?, timeOfDay?, tags?, description?, isArchived? }
  Output: Habit

habits.complete
  Input:  { id, date?: string (YYYY-MM-DD), source?: 'MANUAL' | 'ROUTINE' }
  Output: { completion: HabitCompletion, streak: Streak }

habits.delete
  Input:  { id }
  Output: { success: true, tasksDeleted: number }

habits.getStreak
  Input:  { id }
  Output: Streak

habits.getHeatmap
  Input:  { id, from?: string, to?: string }
  Output: { date: string, completed: boolean, source: string }[]
```

### Analytics

```
analytics.summary
  Input:  { from: string, to: string }
  Output: { tasksCompleted: number, habitsHit: number, streaksMaintained: number, topHabit: string }

analytics.habitTrend
  Input:  { habitId: string, from: string, to: string, interval: '7d' | '30d' }
  Output: { date: string, completionRate: number }[]

analytics.export
  Input:  { format: 'csv' | 'json', from?: string, to?: string }
  Output: { downloadUrl: string, expiresAt: string }
  Gate:   PRO tier required
```

### Subscriptions

```
subscriptions.getCurrent
  Input:  {}
  Output: Subscription

subscriptions.createCheckout
  Input:  { plan: 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'TEAM_MONTHLY', successUrl: string, cancelUrl: string }
  Output: { checkoutUrl: string }

subscriptions.createPortal
  Input:  { returnUrl: string }
  Output: { portalUrl: string }

subscriptions.useFreeze
  Input:  { habitId: string, date: string }
  Output: { success: boolean, tokensRemaining: number }
```

### Error Codes

All tRPC errors use standard TRPCError codes:

| Code | Meaning |
|---|---|
| UNAUTHORIZED | Session missing or expired |
| FORBIDDEN | Authenticated but insufficient tier |
| NOT_FOUND | Resource not found or not owned by user |
| BAD_REQUEST | Validation error (Zod) |
| TOO_MANY_REQUESTS | Rate limit exceeded |
| INTERNAL_SERVER_ERROR | Unexpected server error |

---

## 9. Premium Subscription Model

### Tiers & Pricing

| Plan | Monthly Price | Annual Price (per month) | Annual Savings |
|---|---|---|---|
| Free | $0 | $0 | — |
| Pro | $7/month | $5/month ($60/year) | 29% |
| Team | $12/seat/month | $9/seat/month ($108/seat/year) | 25% |

### Free Trial

- 14-day Pro trial for all new accounts
- No credit card required
- Full Pro feature access during trial
- Trial converted to Free if no payment method added
- Email sequence: welcome (day 0), feature highlight (day 3), value reminder (day 10), expiry warning (day 13), expiry confirmation (day 14)

### Upgrade & Downgrade

- Upgrade is immediate; user billed prorated for remaining period
- Downgrade takes effect at end of current billing period
- On downgrade: Pro features hidden but data preserved (habits > 5 are archived, not deleted)
- Annual subscriptions can switch to monthly at next renewal, not mid-cycle

### Cancellation & Refunds

- Cancel anytime via the in-app billing portal (Stripe Customer Portal)
- No refunds on annual plans (communicated clearly at checkout)
- Monthly plans: cancellation effective end of billing period
- Account and data retained for 90 days post-cancellation before deletion (configurable in settings)

### Feature Flags Implementation

Feature flags wrap premium features at both API (server-enforced) and UI (upgrade prompt) layers:

```typescript
// Server-side gate example (tRPC middleware)
const premiumProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.tier === 'FREE' && ctx.user.trialEndsAt < new Date()) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'PRO_REQUIRED' });
  }
  return next();
});
```

---

## 10. UI/UX Guidelines & Branding

### Design Principles

1. **Calm productivity.** The UI should reduce anxiety, not add to it. No aggressive reds, no infinite scrolling, no dark patterns.
2. **Motion with purpose.** Animations exist to confirm action and celebrate achievement — not to decorate. Every animation has a functional reason.
3. **Progressive disclosure.** New users see a clean, minimal surface. Power features reveal themselves as users grow.
4. **Consistent rhythm.** 8px base grid, 4px micro-grid. Spacing should feel musical.

### Colour System

| Token | Light Mode | Dark Mode | Use |
|---|---|---|---|
| `--colour-brand` | `#5B4CF0` | `#7C6FF7` | Primary CTA, streak flames |
| `--colour-success` | `#16A34A` | `#22C55E` | Completion states |
| `--colour-warning` | `#D97706` | `#F59E0B` | Streak at-risk (1 day left) |
| `--colour-danger` | `#DC2626` | `#EF4444` | Streak broken |
| `--colour-surface` | `#FFFFFF` | `#1C1C1E` | Card backgrounds |
| `--colour-muted` | `#F3F4F6` | `#2C2C2E` | Subtle backgrounds |
| `--colour-text-primary` | `#111827` | `#F9FAFB` | Body text |
| `--colour-text-secondary` | `#6B7280` | `#9CA3AF` | Metadata, placeholders |

Dark mode is system-default and user-toggleable. All colour pairs pass WCAG 4.5:1 contrast ratio.

### Typography

- **Font:** Inter (variable) — loaded from Fontsource (self-hosted, no Google Fonts privacy issues)
- **Scale:** 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40px (modular scale 1.25)
- **Line height:** 1.5 body, 1.2 headings
- **Letter spacing:** -0.02em headings, 0 body

### Branding

- **Logo:** Stylised flame integrated into a checkmark — single SVG, optimised to under 2KB
- **Wordmark:** "StreakFlow" in Inter SemiBold — never stretched, never on a busy background
- **Tone of voice:** Direct, warm, never preachy. Celebrate wins. Acknowledge setbacks without guilt-tripping.
- **Streak flame:** Animated SVG, grows in size at milestones (7, 30, 100 days). Cooling flame animation plays when a streak resets.

### Responsive Breakpoints

| Name | Min-width | Target |
|---|---|---|
| Mobile | 0px | Single-column, thumb-friendly tap targets (min 44×44px) |
| Tablet | 768px | Two-column layout, sidebar navigation |
| Desktop | 1280px | Three-column (sidebar + content + detail panel) |

---

## 11. Testing Strategy

### Testing Pyramid

```
         ┌────────────────────────────┐
         │   End-to-End (Playwright)  │  ← 10% of tests, high value flows
         ├────────────────────────────┤
         │  Integration (Vitest)      │  ← 30% — tRPC routes, DB operations
         ├────────────────────────────┤
         │  Unit (Vitest)             │  ← 60% — pure functions, hooks, utils
         └────────────────────────────┘
```

### Unit Tests

- All utility functions (streak calculation, timezone handling, recurrence expansion)
- Custom React hooks (with `@testing-library/react`)
- Zod schemas (validation edge cases)
- Feature flag logic

### Integration Tests

- tRPC route handlers (with test database via Testcontainers)
- Stripe webhook processing
- BullMQ job handlers
- Sync conflict resolution logic

### End-to-End Tests (Playwright)

Critical user journeys (run on every PR):

1. Sign up → create first habit → complete it → see streak increment
2. Upgrade to Pro → verify gated feature unlocks
3. Complete a habit offline → reconnect → verify streak sync
4. Cancel subscription → verify downgrade at period end
5. Invite a team member → accept invite → see shared space

### Accessibility Testing

- Automated: Axe-core (via `@axe-core/playwright`) on every E2E run
- Manual: keyboard-only navigation audit before each major release
- Screen reader: NVDA (Windows) and VoiceOver (macOS) tested manually quarterly

### Performance Testing

- Lighthouse CI on every PR (budgets: LCP < 2.5s, CLS < 0.1, INP < 200ms)
- k6 load tests run weekly against staging (500 concurrent users, 5-minute ramp)

---

## 12. Deployment, CI/CD & Monitoring

### CI Pipeline (GitHub Actions)

```yaml
# Triggered on: push to main, PRs to main

jobs:
  lint-and-typecheck:   # ESLint + tsc --noEmit
  unit-tests:           # Vitest (no DB)
  integration-tests:    # Vitest + Postgres via Testcontainers
  e2e-tests:            # Playwright (staging environment)
  lighthouse-ci:        # Performance budget check
  axe-accessibility:    # Automated a11y
  build:                # Next.js build + bundle analysis
  docker-build:         # Worker image build
```

### Deployment Pipeline

```
PR opened → CI passes → Preview deploy (Vercel) → Review
Merge to main → CI passes → Deploy to staging → Smoke tests
Manual promote → Deploy to production (Vercel + Fly.io worker)
```

Zero-downtime deployments: Vercel handles web; Fly.io uses rolling restart with health checks for the worker.

### Database Migrations

- Prisma Migrate generates migration files committed to source control
- Migrations run automatically on deploy via `prisma migrate deploy`
- Destructive migrations (column drops) require an explicit approval step in CI

### Monitoring Stack

| Concern | Tool | Alert threshold |
|---|---|---|
| Frontend errors | Sentry | Error rate > 0.5% of sessions |
| API errors | Sentry | 5xx rate > 1% of requests |
| API latency | Grafana | p95 > 500ms sustained 5 min |
| Worker queue depth | Grafana | Queue depth > 1,000 for > 10 min |
| Stripe webhooks | Stripe Dashboard | Failed delivery > 5 in 1 hour |
| Database CPU | Neon Metrics | CPU > 80% sustained 5 min |
| Uptime | Better Uptime | Downtime > 1 min |

All alerts route to PagerDuty for on-call rotation (P1), Slack `#incidents` channel (P1+P2), and email (P2+P3).

---

## 13. Analytics Events

All events sent via PostHog. Events follow the naming convention: `noun_verb` (past tense).

| Event | Properties | Trigger |
|---|---|---|
| `user_signed_up` | method (oauth/magic_link), source | First account creation |
| `user_logged_in` | method | Successful authentication |
| `task_created` | has_habit, has_due_time, priority | Task created |
| `task_completed` | habit_id, streak_updated, streak_value | Task marked done |
| `habit_created` | frequency_days_count, has_icon, has_colour | Habit created |
| `habit_completed` | source (manual/task/routine), streak_value, is_pr | Habit checked off |
| `streak_broken` | habit_id, broken_at_day | Streak resets to 0 |
| `streak_milestone` | habit_id, milestone (7/30/100/365) | Milestone reached |
| `freeze_token_used` | habit_id, tokens_remaining | Freeze applied |
| `routine_completed` | routine_id, habits_count, duration_seconds | Routine finished |
| `upgrade_prompt_shown` | feature, current_tier | Upgrade gate shown |
| `upgrade_started` | plan, trigger_feature | Checkout initiated |
| `subscription_activated` | plan, is_annual | Subscription created |
| `subscription_cancelled` | plan, reason (survey), days_active | Cancellation |
| `export_requested` | format, record_count | Data export |
| `space_created` | member_count | Space created |
| `space_joined` | space_id, via (invite_link/email) | Member joins space |
| `keyboard_shortcut_used` | shortcut | Keyboard shortcut fired |
| `offline_action_queued` | action_type | Action queued while offline |
| `sync_completed` | queued_actions_count, conflicts_resolved | Offline sync finishes |
