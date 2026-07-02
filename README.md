# Jungle Summer — summer.jungle.baby

Seasonal discovery site helping Singapore families find **one-off kids
experiences** — events, festivals, shows, museums, outdoor play, library and
attraction programmes — that are **not already bookable on
[www.jungle.baby](https://www.jungle.baby)** (the marketplace owns recurring
camps, classes and lessons).

Next.js 15 (App Router) + Supabase (`things_to_do` table), deployed on Vercel.

- **How the whole pipeline works** → this file, next section
- **How to review new listings (weekly)** → [docs/REVIEW_GUIDE.md](docs/REVIEW_GUIDE.md)
- **Audit-system internals (eval, API, cron)** → [docs/audit-system.md](docs/audit-system.md)
- **Original product spec** → [docs/jungle_summer_prd.md](docs/jungle_summer_prd.md)

---

## How the whole process works

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 1. DISCOVER (weekly, automated)                                          │
│    "Jungle things to do" routine — repo: jungle-summer-extract           │
│    Crawls ~16 sources (Children's Season, GBTB, NLB, Science Centre …)   │
│    → merge.py: dedupe by title, drop ended events, per-source caps,      │
│      seen-titles ledger computes THIS WEEK'S DELTA (results_new)         │
│    → geocode.py: adds lat/lng                                            │
└──────────────────────────┬───────────────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 2. INGEST + EVAL GATE (automated)                                        │
│    scripts/ingest.mjs — evaluates every new event (lib/eval.mjs):        │
│      accuracy   · required fields, enums, dates, price consistency       │
│      category   · is it a one-off experience, not a class/camp?          │
│      overlap    · is the provider already a www.jungle.baby merchant?    │
│                   (fuzzy-match vs ~1,200 names from the live sitemap)    │
│                                                                          │
│    clean + on-category  → approved + active   →  LIVE, no review needed  │
│    any hard flag        → needs_review + draft → HELD for a human        │
└──────────────┬─────────────────────────────────────┬─────────────────────┘
               ▼ (~75% of a typical week)            ▼ (~25%)
┌──────────────────────────┐        ┌────────────────────────────────────────┐
│ 3a. LIVE on the site     │        │ 3b. HUMAN REVIEW — /admin/review       │
│  Browse only shows       │        │  "New this week" tab shows the delta;  │
│  review_status=approved  │        │  each card shows its eval flags.       │
│  status active/expired   │        │  Approve / Reject / Edit — singly or   │
│                          │◀───────│  BULK ("Select clean" → Approve).      │
└──────────────┬───────────┘approve └────────────────────────────────────────┘
               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 4. RETIRE (daily, automated)                                             │
│    Vercel cron 02:00 SGT → /api/cron/expire flips active listings with   │
│    end_date < today to status=expired → they drop off the site.          │
└──────────────────────────────────────────────────────────────────────────┘
```

Humans only ever touch step 3b — the flagged minority. Everything else is
automated, and every automated decision is testable (`npm run eval:test`).

### Visibility model

The public Browse page requests only
`review_status = 'approved' AND status IN ('active','expired')`. Flipping a
record's status is all it takes to show or hide it:

| To do this            | Set                                          | Who does it              |
|-----------------------|----------------------------------------------|--------------------------|
| Publish               | `approved` + `active`                        | ingest (clean) or reviewer |
| Hold for review       | `needs_review` + `draft`                     | ingest (flagged) / uploader |
| Reject / hide         | `rejected` + `archived`                      | reviewer                 |
| Retire an ended event | `status = expired`                           | daily cron               |

`supabase/enforce_rls.sql` additionally enforces this at the database level
(run once in Supabase Studio) so the raw REST API can't leak drafts.

---

## How to review (the 5-minute weekly routine)

Full guide with a flag-by-flag decision table: **[docs/REVIEW_GUIDE.md](docs/REVIEW_GUIDE.md)**.
The short version:

1. Open **`/admin/review`**, unlock with `ADMIN_REVIEW_SECRET`.
2. **New this week** (default tab) = everything ingested in the last 7 days.
   Clean records already went live; flagged ones are held.
3. Open **Needs review** and read each card's flags:
   - 🔴 **ERROR** — broken data or a provider already on www.jungle.baby → usually **Reject**
   - 🟡 **WARN** — fixable (price wording, missing image, looks-like-a-class) → **Edit**, then approve
4. Tick **Select clean** → **✓ Approve selected** to bulk-publish the good ones.
5. Spot-check the **Live** tab (auto-published records keep their flags visible; **Expire/Hide** anything off).

There's also a collapsible **"How to review"** panel built into the page itself.

---

## Repo map

```
app/
  page.jsx, [eventId]/          public site (landing, detail)
  _components/Browse.jsx        browse UI — holds the public visibility filter
  admin/page.jsx                Excel bulk-uploader (manual fallback; rows land held)
  admin/review/page.jsx         ★ the review queue UI
  api/admin/things[/[id],/bulk] review API (service-role; secret checked server-side)
  api/cron/expire/              daily auto-expiry endpoint
lib/
  eval.mjs                      ★ the evaluator (pure, deterministic, tested)
  marketplace-names.json        cached www.jungle.baby merchant list (~1,200)
  supabase-admin.js             server-only service-role client + auth check
scripts/
  ingest.mjs                    ★ eval-gated ingestion of the weekly delta
  analyze.mjs                   CLI audit report over any slice of the table
  expire.mjs                    manual/local expiry (dry-run by default)
  sync-marketplace.mjs          refresh marketplace-names.json from the live sitemap
  eval.test.mjs                 13 automated eval tests (run in CI)
supabase/
  migration.sql                 schema  ·  enforce_rls.sql  RLS hardening (run once)
docs/                           REVIEW_GUIDE, audit-system, PRD
.github/workflows/ci.yml       CI: eval tests + build on every push/PR
vercel.json                     daily expiry cron (02:00 SGT)
```

★ = the heart of the automated process.

## Commands

```bash
npm run dev               # local site on :3004
npm run eval:test         # the automated eval/accuracy suite (13 tests)
npm run analyze           # audit the review queue from the CLI
npm run analyze -- --status=approved     # audit what's live
npm run ingest -- <csv> --new-only            # dry-run ingest of a weekly delta
npm run ingest -- <csv> --new-only --apply    # real ingest
npm run expire            # dry-run expiry; --apply to execute
npm run sync-marketplace  # refresh the merchant-overlap list
```

## Environment (server-only, never committed)

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public site reads |
| `SUPABASE_SERVICE_KEY` | review API + ingest + cron (bypasses RLS) |
| `ADMIN_REVIEW_SECRET` | login for `/admin/review`; validated server-side per request |
| `CRON_SECRET` | authorises `/api/cron/expire` |

## Go-live checklist (one-time)

1. Merge the audit-system PR → Vercel deploys the review gate.
2. Run `supabase/enforce_rls.sql` in Supabase Studio (DB-level gate).
3. Ensure the four env vars above exist in Vercel (production).
4. In the weekly routine's environment set `JUNGLE_SUMMER_INGEST=1`
   (until then the routine's ingest step is a dry run and writes nothing).

Details + first-run instructions: [docs/REVIEW_GUIDE.md](docs/REVIEW_GUIDE.md) §A.
