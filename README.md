# AssessTrack

A clinical assessment builder and tracker for a solo psychology practice. Build custom psychometric assessments (or use standardized scales like PHQ-9/GAD-7), send them to clients as a one-off link — no login required on their end — and get automatic scoring, severity bands, and score-over-time trends per client.

Built as a single-clinician tool. No multi-therapist support, no billing, no client-facing login portal — see [Non-Goals](#non-goals-v1) below.

## Status

Actively in development. Current state:

| Area | Status |
|---|---|
| Clinician login (JWT, forced password change on first login) | ✅ |
| Assessment builder (6 question types, drag-to-reorder, live preview) | ✅ |
| Client roster (add/edit/search/archive) | ✅ |
| Send flow (tokenized links, Awaiting Response queue) | ✅ |
| Profile (avatar, name, password) | ✅ |
| Public client-facing submission page | 🚧 |
| Scoring engine (point values, subscales, severity bands) | 🚧 |
| Client detail page (score-trend charts, response detail) | 🚧 |
| Reminder emails, clinic-wide overview dashboard | 🚧 |
| Android app (Capacitor wrapper) | 🚧 |

## Tech stack

- **Next.js** (App Router) — frontend + backend in one deployable
- **Postgres via Neon** — serverless-friendly, pooled connections
- **Prisma 7** (driver-adapter mode, `@prisma/adapter-pg`) — schema + queries
- **Tailwind CSS v4** — styling, with automatic dark mode (`prefers-color-scheme`)
- **`jose`** — JWT signing/verification for clinician sessions
- **`bcryptjs`** — password hashing
- **`@dnd-kit`** — touch-friendly drag-to-reorder in the form builder
- **Vercel** — hosting (Hobby/free tier)

## Local setup

**Prerequisites:** Node 20+, a free [Neon](https://neon.tech) Postgres project.

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```
DATABASE_URL=      # Neon pooled connection string
DIRECT_URL=        # Neon direct (unpooled) connection string — used by Prisma Migrate
JWT_SECRET=         # random secret, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
SEED_CLINICIAN_EMAIL=
SEED_CLINICIAN_PASSWORD=
SEED_CLINICIAN_NAME=
```

Then:

```bash
npx prisma migrate dev   # apply schema to your Neon DB
npx prisma db seed       # create the clinician login from SEED_CLINICIAN_* above
npm run dev
```

The seeded account is forced to change its password on first login — the seed values are meant to be temporary.

## Deployment

Deploys to Vercel directly from this repo. Set the same environment variables in the Vercel project settings (never commit `.env`). The app is designed around Vercel Hobby's free-tier constraints: pooled DB connections are mandatory (serverless functions can't hold a connection pool themselves), no background workers/cron beyond Vercel Cron, and a 10s function timeout.

## Non-Goals (v1)

Multi-therapist accounts, video/audio assessments, billing, a client-facing login portal, iOS app, e-signatures. The data model has owner/tenant scoping built in so multi-therapist support can be added later without a rewrite, but there's no UI for it yet.

---

## Security

This app stores mental health data — treated as the most sensitive category of personal data it could plausibly handle. Concrete measures in place:

- **All traffic over HTTPS** in production (Vercel default).
- **Client-facing links use a cryptographically random, unguessable token** (`crypto.randomBytes(32)`, base64url-encoded — see `src/lib/token.ts`) as the *only* access control on a client's submission. Tokens are never derived from a sequential ID, timestamp, or any predictable value.
- **Links expire** (14 days) and are single-use (a completed instance can't be resubmitted).
- **Clinician passwords are hashed with bcrypt** (12 salt rounds), never stored or logged in plaintext.
- **Session auth is a signed, httpOnly, `sameSite: lax` JWT cookie** — not readable by client-side JavaScript, not sent cross-site.
- **Deleting a template that's already been sent to a client is blocked**, both at the application layer and via a database-level foreign-key constraint (`onDelete: Restrict`), so a historical clinical response can never be silently orphaned.
- **Clients are never hard-deleted**, only archived — the same reasoning applies to any record with clinical history attached.
- **No third-party analytics, ad pixels, or tracking scripts** on the client-facing assessment page. A client filling out a mental-health questionnaire hasn't consented to being tracked by anything beyond the assessment itself.
- **Database encryption at rest** is provided by Neon (verify current status in your Neon project settings — this is a platform guarantee, not something this codebase configures).
- Environment variables (DB credentials, JWT secret) are kept out of the repo and set directly in Vercel's project settings.

**Reporting a security issue:** if you find a vulnerability, please don't open a public GitHub issue — contact the maintainer directly.

## Privacy

- The only people with access to client data are the clinician (via her login) and, per-assessment, the specific client who holds that assessment's unique link.
- Client contact info (name, phone, email) is collected solely for the clinician's own reference and to generate assessment links — it is never used for marketing, sold, or shared with any third party.
- No account or login is required of clients. Their only interaction with the system is filling out and submitting one form via a link they were given directly.
- Assessment responses are retained indefinitely by default (clinical history is not auto-deleted), matching the expectation that a clinician needs a durable longitudinal record — clients should be informed of this by their clinician outside the app.

> **This section describes the technical privacy measures built into the app — it is not a substitute for a legally reviewed privacy policy.** Mental health data may fall under stricter data-protection obligations depending on jurisdiction (for example, "sensitive personal data" under India's DPDP Act, or equivalent health-data regulations elsewhere). Before using this app with real clients beyond a personal pilot, have your institution's data-privacy or legal contact review actual compliance requirements for your jurisdiction and practice.

## Accessibility

- Full keyboard navigation on the assessment builder's drag-to-reorder (via `@dnd-kit`'s built-in keyboard sensor), not just pointer/touch.
- Semantic form controls throughout (`label`/`input` pairing, native `radio`/`checkbox`/`select` elements) rather than custom-styled non-semantic widgets, so screen readers and browser autofill behave correctly.
- Dark mode follows system preference (`prefers-color-scheme`) automatically, rather than requiring a manual toggle.
- Destructive actions (delete, archive, cancel a send) always require an explicit confirm step, reducing the chance of an accidental action being hard to recover from.

**Known gaps, not yet addressed:** no formal WCAG audit has been run; color contrast in the current palette hasn't been checked against AA thresholds; the client-facing public form (in progress) hasn't yet been tested with a screen reader end-to-end. Treat this section as "what's been considered," not a compliance claim.

---

Built with [Claude Code](https://claude.com/claude-code).
