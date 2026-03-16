# reppr.fit

A mobile-first PWA for personalized workout tracking. Reppr generates training programs based on your goals, lets you run sessions with real-time set tracking, and keeps a full history of your progress — all synced to the cloud.

---

## Features

- **Smart routine generation** — answer 4 questions (goal, level, days/week, equipment) and get a full weekly split automatically generated (PPL, Upper/Lower, Full Body, and more)
- **Week editor** — rearrange days, swap exercises from a catalog of 873+ movements
- **Active sessions** — track sets, reps, and weight in real time; skip exercises, add or remove sets on the fly
- **Session history** — every completed workout is saved with duration and per-exercise stats
- **Home dashboard** — today's workout preview, last session summary, and training streak
- **Google OAuth** — one-tap login via Supabase Auth
- **PWA** — installable on iOS and Android, runs in standalone mode

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript 5.9 |
| Build | Vite 7 + SWC |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 (per-domain stores, selective persist) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Animations | Motion, Radix UI, Base UI |
| Testing | Vitest |
| Deploy | Vercel |

---

## Architecture

### Store design
Four independent Zustand stores handle different concerns:

- `useAuthStore` — session lifecycle, ties into Supabase `onAuthStateChange`
- `useRoutineStore` — weekly schedule with versioned persistence (`version: 2`) and a `migrate` hook that regenerates schedules on logic updates without breaking existing users
- `useSessionStore` — active session state + completed history; uses `partialize` to keep ephemeral active state out of localStorage
- `useProfileStore` — user profile (sex, birth year, weight, height)

### Route structure
```
/auth               → Google OAuth login
/setup              → 4-step profile onboarding
/                   → Dashboard
/routines           → Quiz → WeekEditor flow
/routines/edit/:day → Day editor with exercise search
/exercises          → Active session (TrainingDay / RestDay)
/session/summary    → Post-workout summary
```

Pages act as orchestrators. UI components are pure and receive only what they need.

### Schedule generation
`generateSchedule.ts` is a pure function — `RoutineSetupAnswers → WeekSchedule`. It contains 24 predefined splits (4 goals × 6 day counts) and filters exercises by available equipment. Isolated from the UI, fully unit-tested, easy to replace.

### Type safety
Discriminated unions enforce exhaustive handling:
```ts
type DaySchedule =
  | { type: 'training'; workoutName: string; exercises: DayExercise[]; muscleGroups: string[] }
  | { type: 'rest' }
```

---

## Security

- CSP headers configured in both Vite (dev) and Vercel (prod)
- Supabase RLS on all user tables — anon key exposure doesn't grant cross-user data access
- Service role key only used in Node scripts, never in the frontend bundle
- Generic error messages in auth flows — no internal details exposed to the client
- Input bounds validation on all numeric profile fields

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Start dev server
npm run dev
```

### Environment variables

```bash
VITE_SUPABASE_URL=        # Supabase project URL
VITE_SUPABASE_ANON_KEY=   # Supabase anon key (safe for frontend)
ANTHROPIC_API_KEY=        # Only used in enrich scripts
```

## Project Structure

```
src/
├── components/
│   ├── excercises/     # Session UI (TrainingDay, RestDay, ActiveExerciseRow)
│   ├── home/           # Dashboard components
│   ├── routines/       # Quiz, WeekEditor, generateSchedule
│   ├── shared/         # EmptyState
│   └── ui/             # Primitives (Button, Skeleton, NavigationBar)
├── hooks/              # useExercises (paginated search + debounce + AbortController)
├── lib/                # supabase client, constants, utils
├── pages/              # Route-level components (orchestrators)
├── store/              # Zustand stores + tests
└── types/              # Centralized TypeScript types
```

---

## Tests

```bash
npm run test         # Run once
npm run test:watch   # Watch mode
```

Unit tests cover `generateSchedule` (11 cases) and `useSessionStore` (9 cases).

---

## License

MIT
