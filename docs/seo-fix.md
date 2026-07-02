# SEO/GEO fix — summer.jungle.baby

## TL;DR
`summer.jungle.baby` was missing real `robots.txt`, `sitemap.xml`, and `llms.txt` —
the `/[eventId]` catch-all route was intercepting those paths and returning soft-404
HTML pages. Added native Next.js routes that generate all three from the existing
event data. **Live in production**, with a review PR open.

**Review PR:** https://github.com/junglebabydev/jungle-summer/pull/9

## The problem
On `summer.jungle.baby`, requests to `/robots.txt`, `/sitemap.xml`, and `/llms.txt`
returned `200` with `content-type: text/html` — i.e. the dynamic
`app/[eventId]/page.jsx` route was matching them as if "robots.txt" were an event
slug and rendering an app page.

Consequences:
- **No crawl directives** for search engines.
- **No sitemap** → 396 event pages were undiscoverable by Google.
- **No `llms.txt`** → invisible to AI search (ChatGPT, Perplexity, Google AI Overviews).
- **Indexable junk pages** generated for non-existent paths.

## What changed
Three new files in `app/` (Next.js 15 App Router). Native metadata routes / route
handlers take precedence over the `/[eventId]` dynamic segment, so the interception
stops.

| File | Serves | What it does |
|---|---|---|
| `app/robots.js` | `/robots.txt` | Allows crawling; disallows `/admin` and `/api/`; declares sitemap + host. |
| `app/sitemap.js` | `/sitemap.xml` | **404 URLs** — 8 static pages + all 396 events, generated from the static `EVENTS` dataset. |
| `app/llms.txt/route.js` | `/llms.txt` | Structured doc for AI engines: site summary + all 396 listings with age/location/price/dates/venue. |

- Net diff: **3 files, +102 lines.** No existing code modified.
- Fully static — generated at build time, no runtime/DB dependency.

## Verification
- `next build` → `/robots.txt`, `/sitemap.xml`, `/llms.txt` all prerender as static
  (`○`) and override `ƒ /[eventId]`.
- Live, post-deploy:
  - `/robots.txt` → `200 text/plain` ✅
  - `/sitemap.xml` → `200 application/xml` (404 `<loc>` entries) ✅
  - `/llms.txt` → `200 text/plain` (396 listings) ✅

## Deploy status
- Merged to `master`; Vercel git-integration auto-deployed (~15s). **Currently live
  in production.**
- PR #9 is for **retroactive review** — its base branch (`seo-review-base`) is pinned
  to the pre-change commit so the diff is viewable even though the commit is already
  on `master`.
- Branch note: review branch is `seo-robots-sitemap-llms` (not `ve` — that name was
  already taken by an unrelated feature branch).

## Recommended follow-ups (not in this PR)
1. **`/[eventId]` soft-404** — unknown event ids still return `200` instead of `404`
   (infinite crawl-space risk Google penalizes). Fix: call `notFound()` server-side
   for unknown ids.
2. **`partner.jungle.baby`** — has the identical catch-all bug (`/[merchantName]`);
   needs the same three files in the `v0-ja-cademy` repo.
3. **Client-rendered content** — event detail pages render client-side (`'use
   client'`), so listing content isn't in the initial HTML. Consider server-rendering
   key content for stronger indexing.
