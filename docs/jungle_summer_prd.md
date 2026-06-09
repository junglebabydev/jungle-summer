# Jungle Summer: PRD

**Owner**: Vaibhav
**Builders**: Vaibhav, Jasmit
**Target ship**: Weekend of 7–8 June 2026
**Status**: Draft v1

---

## 1. Overview

A seasonal discovery page on jungle.baby that helps Singapore families find free and low-cost things to do during the June school holidays and beyond. Unlike the main Jungle marketplace, which is camp and activity bookings, this page is about events, festivals, shows, places to explore, and outdoor play. The entry point is the experience, not the provider.

**Reference site**: [NYC.gov/Summer](https://www.nyc.gov/content/summer/pages/). The NYC mayor's office launched this as an interactive finder for free and low-cost summer programming for young New Yorkers, searchable by age, ZIP code, interests, and distance. Jungle Summer is the Singapore-family-focused equivalent, scoped to events rather than youth-program signups.

**URL**: jungle.baby/summer

---

## 2. Naming

The new entity is called a **Thing to Do** (plural: Things to Do). The existing `events` table in the Jungle booking schema is unrelated and is reserved for booking-system event records.

- **Database table**: `things_to_do`
- **Code type**: `ThingToDo`
- **UI label (singular)**: "thing to do"
- **UI label (plural)**: "things to do"
- **Page section headers**: "Things to do this June," "Free things to do," etc.

---

## 3. Scope

### In scope for v1 (ship this weekend)

- Landing page with hero, intro, and two CTAs (Get started, Browse all)
- Browse / results page with map and filterable list, mobile-first
- Filter bar: age, when, area, price, type
- Card with Free badge, expired state, send-to-me sharing
- Detail page with image grid, About, When, sidebar with Visit site and Send to me
- Send-to-me flow: email (link) and phone (SMS) via Twilio, with captcha and IP-based rate limiting
- Save contact after first use for one-click resend
- Anonymous browsing, no login
- 100+ Things to Do, scraped weekly from priority sources
- Expired Things to Do shown greyed with "Expired" badge, or hidden via toggle
- UTM tagging on all outbound "Visit site" links
- Tracking: page visits, Visit site click-throughs, send-to-me completions
- SEO-friendly metadata and structure

### Out of scope for v1 (defer)

- Merchant submissions via partner.jungle.baby
- Saved / favorited Things to Do (heart icon disabled or hidden)
- Login or user accounts on this page
- Map clustering or advanced map interactions
- WhatsApp send (SMS only at launch)
- Multi-language
- Recommendations engine
- Camps (lives in the existing marketplace, not here)

### Will defer naturally

The heart / save icon will appear in some references but is non-functional in v1. Either hide it or stub it with a tooltip ("Coming soon").

---

## 4. User flows

**Browse flow**
1. Parent lands on jungle.baby/summer
2. Taps Get started or Browse all
3. Sees filtered or unfiltered list of Things to Do, with map alongside on desktop and below on mobile
4. Applies filters as needed
5. Taps a Thing to Do card
6. Lands on detail page
7. Either taps Visit site (UTM-tracked outbound) or Send to me

**Send to me flow**
1. From card or detail page, parent taps Send to me
2. Modal opens with two tabs: Email and Phone
3. First time: enters email or SG phone, captcha if triggered, taps Send
4. Receives email (with link) or SMS (title + short URL)
5. Modal shows confirmation state
6. Contact saved in local storage for one-click resend on future Things to Do

**Copy link flow**
1. From detail page, parent taps Copy link
2. URL copied to clipboard
3. Toast confirms

---

## 5. Information architecture

### Landing page

- Sticky top nav (existing Jungle nav)
- Hero: full-bleed coloured background, sticker-style "Summer in SG" wordmark, white card with H1, subline, primary CTA, secondary CTA
- Below hero: short section explaining what's on (Children's Season, GBTB, etc.)
- Footer (existing Jungle footer)

### Browse page

- Sticky filter bar
- Two-pane on desktop: map left, list right. Stacked on mobile: list first, map collapsible
- Sort: default by date (soonest first)
- Toggle: Show expired (off by default)

### Detail page

- Image grid: 1 large + 2x2 smaller, "Show all photos" button bottom-right
- Title block: type badge, H1, by provider, meta row (location, age, rating)
- About section
- When section: list of date slots with availability state
- Sidebar (sticky on desktop, bottom sheet on mobile): price, Visit site CTA, Send to me CTA, Copy link

---

## 6. Data model

### `things_to_do` table (new, separate from booking system)

```
things_to_do
├── id                    uuid (pk)
├── slug                  text (unique, for SEO URLs)
├── title                 text
├── provider_name         text          # e.g. "Gardens by the Bay"
├── provider_url          text          # canonical event page on source site
├── description           text          # 1-3 sentences
├── long_description      text          # full description for detail page
├── type                  enum          # festival, show, museum, outdoor, library, attraction, free_event
├── categories            text[]        # tags: art, nature, music, stem, etc.
├── price_type            enum          # free, paid, mixed
├── price_min             numeric       # nullable
├── price_max             numeric       # nullable
├── price_display         text          # "Free" | "S$15" | "From S$20"
├── age_min               int           # nullable
├── age_max               int           # nullable
├── age_band              text[]        # ["0-3", "4-6", "7-12", "all_ages"]
├── area                  text          # central, north, north-east, east, west
├── venue_name            text
├── venue_address         text
├── latitude              numeric
├── longitude             numeric
├── start_date            date
├── end_date              date
├── recurrence            text          # nullable, e.g. "weekends", "daily"
├── booking_required      boolean
├── indoor_outdoor        enum          # indoor, outdoor, both
├── hero_image_url        text
├── image_urls            text[]
├── source_name           text          # "Children's Season", "GBTB", "NLB", etc.
├── source_url            text          # the scraped page URL
├── visit_site_url        text          # outbound URL with UTM appended
├── raw_payload           jsonb         # unprocessed scrape output, preserved for re-parsing if source format changes
├── review_status         enum          # needs_review, approved, rejected
├── confidence_score      numeric       # 0.00 to 1.00, from AI extraction or scrape quality check
├── status                enum          # active, expired, draft, archived
├── created_at            timestamptz
├── updated_at            timestamptz
└── last_scraped_at       timestamptz
```

**Review workflow**

Every new record lands with `review_status = needs_review` and `status = draft`. Records are not visible on the public site until `review_status = approved` and `status = active`. Vaibhav or Jasmit review the queue in Supabase Studio or a lightweight admin view, flip status, and the record goes live. AI-extracted records below a confidence threshold (default 0.7) automatically stay in `needs_review` regardless of source.

**Why raw_payload matters**

When NLB or GBTB change their page layout, our parser will start producing garbage in the structured columns. With `raw_payload` preserved, we can re-run extraction against historical scrapes without re-hitting the source. This also covers debugging: when a field looks wrong, we can compare the structured value against the raw input.

### `share_logs` table (tracking sends)

```
share_logs
├── id                    uuid (pk)
├── thing_to_do_id        uuid (fk)
├── channel               enum          # email, sms
├── recipient_hash        text          # sha256 of email or phone, not raw
├── ip_address_hash       text          # for rate limiting
├── status                enum          # sent, failed, bounced
├── created_at            timestamptz
```

We hash recipients for privacy. Raw email/phone never stored server-side. Local storage on the device holds the unhashed contact for one-click resend.

### `view_logs` table (lightweight analytics)

Optional if we lean on a third-party analytics tool (e.g. PostHog or Plausible). If using one of those, skip this table.

```
view_logs
├── id                    uuid (pk)
├── thing_to_do_id        uuid (fk)
├── event_type            enum          # page_view, visit_site_click, share_open, share_send
├── ip_address_hash       text
├── user_agent            text
├── referrer              text
├── created_at            timestamptz
```

---

## 7. Source list and scrape strategy

### Priority sources for v1 (target 100+ Things to Do)

**Government / public**
- Children's Season 2026 — https://www.cgs.gov.sg/events/childrenseason2026/
- National Family Festival — https://kidstart.sg/events/national-family-festival-by-families-for-life/
- National Library Board — https://www.nlb.gov.sg/
- ActiveSG holiday programmes — https://www.activesgcircle.gov.sg/activesg-school-holiday-programmes
- onePA — https://www.onepa.gov.sg/courses
- NParks — https://www.nparks.gov.sg/
- Gardens by the Bay — https://www.gardensbythebay.com.sg/en/things-to-do/calendar-of-events.html

**Museums and culture**
- National Museum Children's Season — https://www.nhb.gov.sg/nationalmuseum/whats-on/programme/childrens-season/events
- National Gallery family programmes — https://www.nationalgallery.sg/sg/en/the-gallery-edit/family-weekends-national-gallery-singapore.html
- Children's Museum Singapore — https://www.heritage.sg/childrensmuseum/whatson/childrens-season---listing-page
- Science Centre — https://www.science.edu.sg/whats-on
- Esplanade — https://www.esplanade.com/whats-on

**Attractions**
- Mandai Wildlife Reserve — https://www.mandai.com/en/discover-mandai/events.html
- Sentosa — https://www.sentosa.com.sg/en/things-to-do/events
- KidZania — https://www.kidzania.com.sg/

**Ticketing and aggregators (lower priority, manual curation)**
- SISTIC, Catch.sg, Klook, BYKidO, HoneyKids, TickiKids, Little Day Out, Time Out

### Scrape approach for v1

Given the weekend ship and non-technical team, do not build a full scraper infrastructure. Instead:

**v1 (this weekend)**
- Manual seeding: 100–150 Things to Do entered through a simple Supabase admin form or directly via Supabase Studio
- Use AI-assisted data entry: feed source URLs to Claude (or a Claude Project) and have it extract structured JSON matching the `things_to_do` schema, then bulk import
- Weekly review by Vaibhav or Jasmit: open priority sources, pull new entries, mark expired ones

**v1.1 (post-launch, 2–3 weeks out)**
- Build proper scrapers using Firecrawl or Puppeteer for the top 5 government/anchor sources
- Schedule weekly cron via Supabase Edge Functions
- Human review queue before publish

**v2**
- Open partner.jungle.baby submission form so merchants can submit their own Things to Do
- Auto-publish for vetted merchants, review queue for new ones

---

## 8. Send to me: copy templates

### Email

**Subject**: Your Jungle pick: {thing_to_do_title}

**Body** (plain text and HTML):
```
You saved this for later. Here it is.

{thing_to_do_title}
{provider_name}
{date_range}
{venue_name}, {area}
{price_display}

{short_description}

See full details and visit the site:
{thing_to_do_url_with_utm}

Found on Jungle, Singapore's family discovery platform.
jungle.baby
```

### SMS (Twilio, 160 char target)

```
Jungle: {thing_to_do_title} ({date_range}) at {venue_name}. {price_display}. Details: {short_url}
```

Use a URL shortener (Bitly or a Supabase function with a `sl_` table) to keep SMS within one segment.

### Confirmation states (UI)

- **Email sent**: "Sent. Check your inbox at {masked_email}."
- **SMS sent**: "Sent. Check your messages at {masked_phone}."
- **Failed**: "Something went wrong. Try again, or copy the link instead."

---

## 9. Page states

### Empty state (browse, no results match filters)

- Illustration (simple, on-brand)
- H2: "Nothing matches those filters"
- Body: "Try widening the age range, area, or date. Or browse everything."
- CTA: "Clear filters"

### Loading state (browse)

- Skeleton cards in the list (6 placeholders)
- Map shows generic Singapore outline with no pins

### Loading state (detail)

- Skeleton image grid
- Skeleton text blocks

### Error state (data fetch fails)

- H2: "Couldn't load this right now"
- Body: "Refresh the page, or try again in a moment."
- CTA: "Reload"

### Expired Thing to Do state

- Card greyed (60% opacity) with "Expired" badge top-left
- Detail page: banner at top "This event has ended. Browse what's on now." with CTA back to browse

### Send to me modal: rate-limited / captcha

- Captcha appears after 3 sends from same IP in 24 hours
- After 10 sends from same IP in 24 hours: "You've hit today's limit. Try again tomorrow."

---

## 10. Tracking and analytics

### Events to capture

| Event | When |
|---|---|
| `summer_page_view` | Landing page loaded |
| `browse_page_view` | Browse page loaded |
| `thing_to_do_view` | Detail page loaded |
| `filter_applied` | Any filter changed |
| `visit_site_click` | Outbound CTA tapped |
| `share_modal_open` | Send to me modal opened |
| `share_send` | Email or SMS successfully sent |
| `copy_link_click` | Copy link tapped |

### UTM convention for outbound

```
?utm_source=jungle&utm_medium=summer&utm_campaign=thing_to_do_{slug}
```

### Tool

Use PostHog or Plausible. PostHog gives funnels and session replay, useful for a v1 launch. Either integrates with Next.js in under 10 minutes.

### Core dashboards to build

- Funnel: landing → browse → detail → visit site
- Funnel: landing → browse → detail → send to me sent
- Top 10 Things to Do by detail page views
- Top 10 Things to Do by Visit site clicks
- Send-to-me channel split (email vs SMS)

---

## 11. Tech stack

- **Frontend**: Next.js (App Router), Tailwind, existing Jungle component library
- **Backend / DB**: Supabase (Postgres + Edge Functions)
- **SMS**: Twilio (one Twilio sub-account dedicated to Jungle Summer for clean billing)
- **Email**: Resend or existing Jungle transactional provider
- **Captcha**: Cloudflare Turnstile (free, lightweight)
- **URL shortener**: Supabase table with 6-char slugs, served at `j.gl/{slug}` if a short domain is available, otherwise `jungle.baby/s/{slug}`
- **Analytics**: PostHog (recommended) or Plausible
- **Maps**: existing Jungle map component (Mapbox or whatever's used in the camps results page)
- **Hosting**: existing Vercel deployment for jungle.baby

---

## 12. SEO

### Targets

Primary keywords:
- "things to do with kids Singapore June holidays"
- "free kids events Singapore"
- "kids activities Singapore this weekend"
- "Singapore school holiday programmes"

### Implementation

- Each Thing to Do at `/summer/{slug}`
- Static generation via Next.js `generateStaticParams` for all active Things to Do
- Open Graph image per Thing to Do (use hero image)
- JSON-LD `Event` schema on every detail page
- Sitemap.xml updated on each weekly scrape
- Landing page H1: "Things to do with kids in Singapore this June"

---

## 13. Success metrics

### Primary (week 1 post-launch)

- 2,000+ landing page visits
- 10%+ visit-site click-through rate from detail pages
- 100+ send-to-me completions
- < 2% error rate on send-to-me flow

### Secondary

- 30%+ filter usage on browse page
- Average 3+ Things to Do viewed per session
- 5%+ of sessions result in either a Visit site click or a send-to-me

### Health

- Captcha trigger rate stays under 5% (high rate means abuse)
- SMS delivery success rate above 95%
- Twilio cost per send under S$0.05

---

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Scraping anchor sources is harder than expected | v1 is manual entry, scrapers come post-launch |
| Twilio SMS costs spike from abuse | Captcha + IP rate limit + daily cap per IP |
| Expired events clutter results | Auto-status flip via daily cron, "Show expired" off by default |
| Source sites change layouts | Scrapers are v1.1; manual entry is the buffer |
| Detail pages thin on info | Always link to provider_url with clear "Visit site" CTA |
| Mobile UX feels cramped with map + filters + list | Map collapsible, filters as bottom sheet on mobile |
| Two non-technical builders blocked on infra | Use Supabase Studio for data entry, no custom admin needed for v1 |

---

## 15. Launch checklist

### Pre-ship

- [ ] Schema migrated in Supabase (`things_to_do`, `share_logs`, optionally `view_logs`)
- [ ] 100+ Things to Do seeded and reviewed
- [ ] All hero images uploaded and optimized
- [ ] Twilio account configured, sender ID approved for SG
- [ ] Resend (or email provider) configured with from-address `summer@jungle.baby`
- [ ] Cloudflare Turnstile keys configured
- [ ] PostHog (or Plausible) installed
- [ ] UTM tagging verified on a sample of Visit site links
- [ ] Mobile QA on iOS Safari and Android Chrome
- [ ] Empty, loading, error, expired states all visible
- [ ] Sitemap submitted to Google Search Console

### Soft launch (Saturday)

- [ ] Deploy to production
- [ ] Smoke test all flows end-to-end
- [ ] Send one Thing to Do to Vaibhav and Jasmit via email and SMS, confirm receipt
- [ ] Share quietly with 5–10 parent friends for feedback

### Wider launch (Sunday or Monday)

- [ ] Newsletter announcement (parent list)
- [ ] LinkedIn post (Jungle company page)
- [ ] Instagram story and post (explorejunglesg)
- [ ] WhatsApp broadcast to existing Jungle audience

---

## 16. Post-launch roadmap

**Week 2–3**
- Build scrapers for top 5 sources
- Add "Show expired" toggle on browse
- Merchant submission form on partner.jungle.baby

**Month 2**
- Saved / favorited Things to Do (requires lightweight auth)
- WhatsApp send option
- Recommendations: "If you liked X, try Y"
- Multi-week date browsing (not just June)

**Month 3+**
- Editorial layer: curated lists ("Best free things this weekend", "Rainy day picks")
- Merchant analytics: show merchants how many parents viewed and clicked through to their listing
- Subscriptions or sponsored placements for merchants

---

## 17. Open questions

- Short domain for SMS links (e.g. `j.gl`) or stick with `jungle.baby/s/{slug}`?
- PostHog or Plausible for analytics? PostHog has more features, Plausible is lighter and privacy-first.
- Hero background colour: green, coral, or sun-yellow? Prototype all three in Claude Design.
- Do we keep the Jungle map component as-is, or strip down to a simpler map for Things to Do (date matters more than pin clustering)?

