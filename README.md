# Plant Care Tracker

CISC 450 final project (Spring 2026). A web app for cataloging indoor plants
and logging waterings, fertilizations, repottings, and health observations,
with a dashboard of what's overdue. The UI is a tongue-in-cheek early-2000s
personal-homepage skin.

**Team:** Josh Dunlap, Aaron Fuentes, Nathan Reeves

## Live site

- **App:** https://plants.auriga.fyi/
- **Source:** https://github.com/joshcd99/cisc450-plant-tracker

The app is fully cloud-hosted; no local setup required.

## Tech stack

- Next.js 16 App Router (React Server Components + Server Actions)
- TypeScript, Tailwind v4
- Supabase Postgres + Drizzle ORM
- Supabase Storage for plant photos
- Deployed on Vercel (auto-deploy on push to `main`)

## Layout

```
src/app/            Pages (dashboard, plants, calendar, schedule, settings, guestbook)
src/components/     UI: forms, cards, retro chrome, sparkline, calendar
src/db/             Drizzle schema + read queries
src/lib/            Server actions, age + day-status helpers, Supabase admin
supabase/           schema.sql (full DDL), seed.sql (demo data)
docs/               Schema diagram, annotated requirements, AI disclosure, reflection
public/cursors/     Leaf cursor files
```

## Database

Nine application tables behind the 11 milestone-1 requirements, plus two
retro-edition tables (guestbook, visitor counter). Care events cascade on
plant delete; lookup FKs restrict.

- Diagram: [`docs/schema.pdf`](docs/schema.pdf)
- Requirement-to-table mapping: [`docs/annotatedRequirements.pdf`](docs/annotatedRequirements.pdf)
- Full DDL: [`supabase/schema.sql`](supabase/schema.sql)

Adding a plant or logging a watering regenerates a year of forward
`watering_schedule` rows at the species' recommended interval, so the
calendar always reflects the current cadence.

## Requirements coverage

All 11 milestone-1 requirements implemented, plus bonus features (full
calendar view, sparkline + streak stats, plant search, photo upload,
inline-create for species/room/location, retro guestbook + visitor counter).
See [`docs/annotatedRequirements.pdf`](docs/annotatedRequirements.pdf).

## Deployment

Vercel auto-deploys `main`; PRs get preview URLs. Supabase connection strings
and the Storage service-role key are set as Vercel env vars. Schema is
applied once from `supabase/schema.sql`; future changes edit that file and
re-apply.
