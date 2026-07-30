# CLAUDE.md — working on Jungle Summer

Context for anyone (human or Claude Code) picking up this repo.
Product/architecture overview: [README.md](README.md).
Reviewer runbook: [docs/REVIEW_GUIDE.md](docs/REVIEW_GUIDE.md).

**Live site:** https://summer.jungle.baby · **Branch:** `master` (not `main`)
**Stack:** Next.js 15 App Router (JSX, no TypeScript) + Supabase + Vercel

---

## What this site is

A seasonal discovery site for **one-off kids experiences in Singapore** —
events, festivals, shows, museums, outdoor play, library and attraction
programmes. It deliberately does **not** list recurring camps/classes/lessons:
those belong to the main marketplace at www.jungle.baby. That boundary is
enforced in code by `lib/eval.mjs` (see "The eval gate" below).

---

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev                        # http://localhost:3004
```

Env vars are documented in `.env.local.example`. The Supabase service key is
in the team's password manager / Supabase dashboard — it is **not** in the repo.

---

## Commands

```bash
npm run dev               # local dev on :3004
npm run build             # production build (CI runs this on every push)
npm run eval:test         # 13 automated eval tests (CI runs these too)
npm run analyze           # audit the review queue from the CLI
npm run expire            # dry-run expiry; add --apply to execute
npm run ingest -- <csv> --new-only          # dry-run ingest of a weekly delta
npm run sync-marketplace  # refresh the marketplace-overlap list
```

---

## Architecture: the two things that matter

### 1. Visibility is driven by two status columns, not by code

The public site only ever requests
`review_status = 'approved' AND status IN ('active','expired')`.
Changing a listing's visibility means changing its status, not editing code:

| To do this            | Set                                        |
|-----------------------|--------------------------------------------|
| Publish               | `approved` + `active`                      |
| Hold for review       | `needs_review` + `draft`                   |
| Reject / hide         | `rejected` + `archived`                    |
| Retire an ended event | `status = 'expired'`                       |

`expired` stays publicly readable on purpose so the "Show expired" toggle
works; the card renders greyed with an "Ended" badge.

### 2. The eval gate (`lib/eval.mjs`)

Pure, deterministic, dependency-free. Scores every listing on accuracy
(required fields, enums, date sanity, price consistency), category fit
(is it a one-off experience, or a recurring class?), and marketplace overlap
(is the provider already on www.jungle.baby?). It **flags; it never
auto-rejects** — a human decides on `/admin/review`.

`ingest.mjs` uses `eval.autoPublishable` (no error-level flags AND
on-category) to auto-publish clean listings and hold the rest.

If you change eval logic, run `npm run eval:test`.

---

## Gotchas that have actually bitten us

These are real incidents, not hypotheticals. Please read before changing
anything in `app/_components/`.

**1. `data.jsx` is a frozen fallback snapshot, NOT live data.**
It's a ~500KB static dump generated once (2026-06-15). Anything reading it
directly will silently show stale dates and long-gone events forever. This
caused two separate "expired events still showing" bugs. **Always** read live
data via `app/_components/liveEvents.js` (`fetchLiveEvents()`), which is the
single source of truth for fetching + normalising Supabase rows. `data.jsx`
is only a network-failure fallback.

**2. `dedupeLanes()` needs live events passed in explicitly.**
It defaults to the static `EVENTS` snapshot for backward compatibility. Every
caller must pass the live array as the 4th argument:
`dedupeLanes(ROWS, 4, [], events)`. Forgetting this is bug #1 all over again.

**3. RLS is not a reliable gate on `things_to_do`.**
The anon key was found able to read every row (including drafts) directly via
the REST API. The site is gated at the **app layer** (the query in
`liveEvents.js`). `supabase/enforce_rls.sql` hardens the database layer too —
run it in Supabase Studio if it hasn't been. Don't assume RLS is protecting
anything.

**4. Vercel env vars need a redeploy to take effect.**
They only apply to deployments created *after* they're added. If
`/admin/review` or the cron 401s with a correct secret, the deployment
predates the var — redeploy.

**5. `CRON_SECRET` missing = ended events silently pile up.**
`/api/cron/expire` runs daily (`vercel.json`, 02:00 SGT) but 401s without the
secret, with no visible error. If you see expired events on the live site,
check this first, then run `npm run expire -- --apply` to catch up.

**6. Don't hardcode the month.**
Use `currentMonthLabel()` from `app/_components/currentMonth.js`. The site
previously hardcoded "June" in six places, plus a "June school holidays ·
2 to 30 June" badge that made a false claim in every other month.

**7. Prices come from freeform source text.**
Don't pre-set `priceInfo` in `transformRecord` — `EventCard`'s
`priceInfoFor()` derives a short "From S$X*" display (asterisk = multiple
prices/conditions). Pre-setting it short-circuits that and long strings
bleed out of the card.

---

## Data pipeline (where listings come from)

Listings are crawled weekly by a **separate repo**:
`~/projects/jungle-summer-extract` (github: `junglebabydev/jungle-summer-extract`),
driven by a scheduled Claude Code routine ("Jungle things to do"). It crawls
~16 sources → dedupes → geocodes → produces `output/results.csv` and a
`results_new.csv` delta → `scripts/ingest.mjs` here eval-gates that delta into
Supabase.

The routine's ingest step is gated behind `JUNGLE_SUMMER_INGEST=1` so it
dry-runs by default.

---

## Conventions

- **JSX, not TSX.** No TypeScript in this repo.
- **Inline styles**, not Tailwind, in `app/_components/`. Match surrounding style.
- Brand colours: green `#009B4D`, ink `#0C3C26`, cream `#F5F5F0`.
  Fonts: `Manrope` (body), `"Feather Bold"` (headings).
- Never commit secrets. `.env.local` and `supabase/.env.local` are gitignored
  (a service key leaked in `d72a789` and again in a hardcoded script example —
  scan before committing).
- **This repo is public.** Don't commit business/CRM data, merchant contact
  details, or anything else you wouldn't publish.
- CI (`.github/workflows/ci.yml`) runs `eval:test` + `build` on every push/PR.
