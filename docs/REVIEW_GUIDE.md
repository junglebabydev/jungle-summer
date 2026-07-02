# Jungle Summer — Weekly Review Guide

Everything you need to run the weekly things-to-do review. Two parts:
**(A)** a one-time go-live setup, then **(B)** the ~5-minute weekly routine.

---

## The pipeline at a glance

```
"Jungle things to do" routine (weekly)
   crawl sources → merge.py (dedupe, drop expired, find the DELTA)
   → geocode.py → ingest.mjs (eval gate)
        ├─ clean + on-category      → LIVE on summer.jungle.baby  (auto)
        └─ flagged / off-category   → /admin/review  (you approve)
   → daily cron expires ended events automatically
```

You only ever touch the **flagged** minority. Clean events publish themselves.

---

## A. One-time setup (do this once, ~10 min)

Until these are done, the review gate is not enforced in production, so the
ingest stays in dry-run.

1. **Merge PR #10** — https://github.com/junglebabydev/jungle-summer/pull/10
   (this deploys the review gate: the site will only show approved listings).
2. **Run the RLS fix** — open Supabase Studio → SQL Editor → paste and run
   `supabase/enforce_rls.sql`. Re-check: the anon key should now return ~220
   rows, not 396. (Closes the raw-API hole; the site is already app-gated.)
3. **Add Vercel env vars** (Project → Settings → Environment Variables):
   - `SUPABASE_SERVICE_KEY` — service-role key (from `supabase/.env.local`)
   - `ADMIN_REVIEW_SECRET` — your login for `/admin/review`
   - `CRON_SECRET` — authorises the daily expiry cron
4. **Turn on auto-ingest** — in the routine's environment, set
   `JUNGLE_SUMMER_INGEST=1` (it defaults to dry-run). From then on each weekly
   run writes the delta into the review queue.

> First batch: before flipping `JUNGLE_SUMMER_INGEST=1`, run the ingest once by
> hand and watch the split:
> ```bash
> cd ~/projects/jungle-summer
> node scripts/ingest.mjs ~/projects/jungle-summer-extract/output/results.csv --new-only            # dry run
> node scripts/ingest.mjs ~/projects/jungle-summer-extract/output/results.csv --new-only --apply     # write
> ```

---

## B. The weekly review (every Monday, ~5 min)

1. Go to **`https://summer.jungle.baby/admin/review`** and unlock with
   `ADMIN_REVIEW_SECRET`.
2. You land on **New this week** — everything ingested in the last 7 days.
   - The green-scored ones with no flags already auto-published. Skim them.
   - The ones with flags are what need you.
3. Switch to **Needs review** (the held queue). For each card read its flags:

   | Flag | Meaning | Usual action |
   |---|---|---|
   | 🔴 **ERROR** `marketplace_overlap` | Provider is already on www.jungle.baby | **Reject** (it belongs in the marketplace) |
   | 🔴 **ERROR** `bad_type` / `date_order` / `bad_*_date` | Broken/invalid data | **Edit** to fix, or **Reject** |
   | 🟡 **WARN** `category_marketplace_domain` | Reads like a recurring class/camp | Reject if it's a class; keep if it's a one-off |
   | 🟡 **WARN** `price_*_looks_mixed` | Price type vs wording mismatch | **Edit** the price type, then approve |
   | 🟡 **WARN** `missing_image` / `missing_link` | Thin listing | **Edit** to add, then approve |

4. **Bulk-approve the good ones:** tick **Select clean** (everything with no
   error-level flags) → **Approve selected**. One click publishes them all.
5. **Reject the rest** individually, or select and **Reject selected**.
6. (Optional) glance at the **Live** tab sorted by score — auto-published
   records still show their flags, so you can **Hide** anything off.

That's it. Approved → live immediately. Ended events expire on their own.

---

## Per-card actions

- **Approve & publish** — `approved` + `active`, visible on the site.
- **Reject** — `rejected` + `archived`, hidden.
- **Expire** — `expired`, hidden (for a still-listed but ended event).
- **Restore** — back to `needs_review` for a second look.
- **Edit** — fix any field inline (title, dates, price, image, …), then save.

---

## Tabs

- **New this week** — the delta (created in the last 7 days), any status.
- **Needs review** — the held queue (your main workload).
- **Live** — what's public now (spot-check auto-published items here).
- **Rejected** — hidden ones (restore if you change your mind).
- **All** — everything.

---

## Troubleshooting

- **Queue is huge / too many holds** — the auto-publish bar is
  `no error-level flags AND on-category`. To let off-category warns through,
  drop the `categoryOk` term in `lib/eval.mjs`. To audit any tab from the CLI:
  `npm run analyze -- --status=needs_review`.
- **Nothing in "New this week"** — the ingest hasn't run with `--apply` yet
  (still dry-run), or no crawl happened in the last 7 days.
- **A marketplace match looks wrong** — the merchant list can drift; refresh it
  with `npm run sync-marketplace`.
- **Something live shouldn't be** — open the **Live** tab, find it, **Hide**.
