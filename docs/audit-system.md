# Jungle Summer — Audit & Review System

An automated pipeline for vetting Summer listings before they go live and
retiring them when they end. It enforces the category contract: Jungle Summer
lists **one-off kids experiences** (events, festivals, shows, museums, outdoor,
library, attractions) that are **not already bookable on www.jungle.baby** (the
marketplace owns recurring camps, classes and lessons).

## How visibility works (no code needed to hide/show)

The public Browse page (`app/_components/Browse.jsx`) only requests rows where
`review_status = 'approved' AND status IN ('active','expired')` (expired stays
in so the "Show expired" toggle works). Flipping a record's status is therefore
all it takes to show/hide it:

| To do this            | Set                                            |
|-----------------------|------------------------------------------------|
| Publish a listing     | `review_status=approved`, `status=active`      |
| Reject / hide         | `review_status=rejected`, `status=archived`    |
| Retire an ended event | `status=expired`                               |
| Send back to queue    | `review_status=needs_review`, `status=draft`   |

New rows (e.g. from the Excel uploader at `/admin`) land as
`needs_review` + `draft`, so nothing is public until a human approves it.

> **Note (2026-06-29):** RLS on `things_to_do` was found NOT to be enforced —
> the anon key could read all rows (including drafts and `raw_payload`)
> directly via the REST API. The Summer site itself is correctly gated by the
> Browse filter above, but run `supabase/enforce_rls.sql` once to also close
> the raw REST endpoint (defense-in-depth). After running it, the anon key
> should return ~220 rows, not 396.

## 1. The evaluator (`lib/eval.mjs`)

Pure, deterministic, dependency-free. `evaluateRecord(record, { marketplaceNames })`
returns `{ score, flags[], categoryOk, hasError, marketplaceMatch }`. It flags —
it never auto-rejects. A human is always the final gate. Checks:

- **Accuracy** — required fields, valid enums (type/price_type/indoor_outdoor),
  date sanity (parseable, end ≥ start), URL-safe slug, price-type vs.
  price-display consistency (ported from `scripts/audit_price_mistags.py`).
- **Category fit** — flags listings that read like a recurring class/camp/lesson
  (the marketplace's domain).
- **Marketplace overlap** — fuzzy-matches the provider/title against the live
  list of ~1,200 www.jungle.baby merchants. Exact full-name match → `error`
  (likely already on the marketplace); partial → `warn`.

Severity → `error` (block approval), `warn` (look closer), `info` (e.g. already
ended). The score is `1 − weighted penalties`.

## 2. Marketplace inventory (`lib/marketplace-names.json`)

Snapshot of merchant names extracted from `https://www.jungle.baby/sitemap.xml`
(the `/merchant/{id}/{slug}` URLs). Refresh periodically:

```bash
npm run sync-marketplace
```

## 3. Review page (`/admin/review`)

The audit UI. Log in with `ADMIN_REVIEW_SECRET`. Tabs: Needs review / Live /
Rejected / All. Each card shows the listing, its eval score and flags, and
Approve / Reject / Expire / Restore / Edit actions. Mutations go through
`/api/admin/things/*`, which validate the secret **server-side** on every
request (the password only gates the React view) and use the service-role key
to bypass RLS.

## 4. Analyze the queue from the CLI

```bash
npm run analyze                 # audit the needs_review queue
node scripts/analyze.mjs --all  # audit everything
node scripts/analyze.mjs --status=approved   # audit what's already live
npm run analyze -- --json       # machine-readable report
```

## 5. Auto-expire ended listings

A Vercel Cron (`vercel.json`) hits `/api/cron/expire` daily at 02:00 SGT and
flips `active` listings with `end_date < today` (non-null) to `expired`.
Authenticated by `CRON_SECRET` (Vercel sends it as a Bearer token
automatically). Manual / local equivalent:

```bash
npm run expire           # dry run — lists what would expire
node scripts/expire.mjs --apply
```

## 6. Automated tests

```bash
npm run eval:test        # node --test scripts/eval.test.mjs
```

Fixtures prove each failure mode is flagged (bad enums, broken dates, price
mistags, off-category camps/classes, real marketplace overlaps) and that a
clean on-category event passes with zero flags.

## End-to-end flow

```
Excel upload (/admin)  ──▶  needs_review + draft  (invisible)
        │
        ▼
  npm run analyze        eval scores + flags every record
        │
        ▼
  /admin/review          human approves / rejects / edits, eval shown inline
        │
   approve ─────────────▶  approved + active  (RLS makes it public)
        │
        ▼
  cron /api/cron/expire   end_date passed ──▶ expired  (drops off the site)
```

## Environment variables (server-only — in `.env.local`, never committed)

- `SUPABASE_SERVICE_KEY` — service-role key; bypasses RLS for review/expire.
- `ADMIN_REVIEW_SECRET` — login for `/admin/review` and its API routes.
- `CRON_SECRET` — authorises the expiry cron.

On Vercel, add all three to Project → Settings → Environment Variables.
