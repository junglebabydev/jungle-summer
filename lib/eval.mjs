// ============================================================
// lib/eval.mjs — Jungle Summer listing evaluator
//
// Pure, deterministic, dependency-free. Given a things_to_do record it
// returns a quality report: accuracy flags, category-fit flags, and a
// marketplace-overlap check against the live www.jungle.baby merchant
// list (lib/marketplace-names.json, refreshed by sync-marketplace.mjs).
//
// The eval FLAGS; it never auto-rejects. A human makes the final call on
// the review page. Severity:
//   error  — almost certainly wrong / off-category / a duplicate of the
//            marketplace. Should block approval until resolved.
//   warn   — likely an issue or missing field worth a look.
//   info   — minor / cosmetic.
//
// Category contract (PRD §1, §3): Jungle Summer lists one-off kids
// EXPERIENCES — events, festivals, shows, museums, outdoor, library,
// attractions — that are NOT already bookable on the Jungle marketplace
// (www.jungle.baby), which owns recurring camps, classes and lessons.
// ============================================================

// Enums mirror supabase/migration.sql.
export const VALID_TYPES = ['festival', 'show', 'museum', 'outdoor', 'library', 'attraction', 'free_event'];
export const VALID_PRICE_TYPES = ['free', 'paid', 'mixed'];
export const VALID_INDOOR_OUTDOOR = ['indoor', 'outdoor', 'both'];

// Wording in a `free` record that implies money actually changes hands
// → likely `mixed`. Ported from scripts/audit_price_mistags.py.
const FREE_TO_MIXED_HINTS = [
  /admission applies/i, /admission required/i, /admission fee/i, /applies for/i,
  /applies to others/i, /fee may apply/i, /separately charged/i, /from \$?\s*\d/i,
  /\bfor others\b/i, /\bticketed\b/i, /general admission/i, /members? \$/i, /\$\d/,
];
// Wording in a `paid` record that implies a free component → likely `mixed`.
const PAID_TO_MIXED_HINTS = [
  /free for /i, /\bfree entry\b/i, /complimentary/i, /some free/i, /many free/i,
  /\bfree (programme|programmes|shows|outdoor)\b/i, /free admission/i,
];

// Signals the listing is a recurring class/camp/lesson — the marketplace's
// domain, not a one-off summer experience (PRD: "Camps live in the
// marketplace, not here").
const MARKETPLACE_DOMAIN_HINTS = [
  /\bterm\b/i, /\benrichment\b/i, /\bweekly\b/i, /\b\d+[-\s]?week\b/i,
  /\btrial class\b/i, /\bclass(es)?\b/i, /\blesson(s)?\b/i, /\bcourse\b/i,
  /\bcamp\b/i, /\bacademy\b/i, /\bsemester\b/i, /\bbootcamp\b/i,
];

// Generic tokens stripped before fuzzy-matching provider/title against
// merchant names, so "Kids Art Studio Singapore" doesn't match every
// merchant containing "kids" or "singapore".
const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'of', 'a', 'an', 'at', 'by', 'in', 'on', 'to',
  'kids', 'kid', 'children', 'childrens', 'child', 'family', 'families',
  'singapore', 'sg', 'class', 'classes', 'camp', 'camps', 'academy', 'school',
  'centre', 'center', 'studio', 'club', 'pte', 'ltd', 'co', 'company',
]);

const norm = (s) => (s == null ? '' : String(s)).toLowerCase().replace(/&amp;/g, '&').trim();

const tokens = (s) =>
  norm(s)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t));

const collapse = (s) => norm(s).replace(/[^a-z0-9]/g, '');

function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

// Best fuzzy match of `text` against a list of normalised merchant names.
// Returns { name, score, kind } where kind is:
//   'exact'   — the whole text IS the merchant name (collapse-equal). High
//               precision → treated as an error.
//   'partial' — strong but inexact overlap (merchant name contained in the
//               text, or >= 2 shared meaningful tokens). Treated as a warn.
// Returns null if no list given or no qualifying match.
//
// We deliberately require >= 2 shared meaningful tokens for `partial`,
// because a single shared token after stopword stripping (e.g. provider
// "Science Centre" → {science} vs merchant "Science Camp" → {science})
// is a coincidence, not a duplicate.
function bestMarketplaceMatch(text, marketplaceNames) {
  if (!marketplaceNames || !marketplaceNames.length) return null;
  const tset = new Set(tokens(text));
  if (tset.size === 0) return null;
  const tcollapsed = collapse(text);

  let best = null;
  for (const name of marketplaceNames) {
    const ntset = new Set(tokens(name));
    if (ntset.size === 0) continue;
    const ncollapsed = collapse(name);

    let score = 0;
    let kind = null;
    if (tcollapsed && ncollapsed && tcollapsed === ncollapsed && tcollapsed.length >= 4) {
      score = 1;
      kind = 'exact';
    } else if (ntset.size >= 2 && ncollapsed.length >= 8 && tcollapsed.includes(ncollapsed)) {
      // Whole multi-token merchant name appears inside the text.
      score = 0.9;
      kind = 'partial';
    } else {
      let shared = 0;
      for (const t of tset) if (ntset.has(t)) shared++;
      if (shared >= 2) {
        const union = tset.size + ntset.size - shared;
        score = shared / union;
        kind = 'partial';
      }
    }
    if (kind && (!best || score > best.score)) best = { name, score, kind };
  }
  return best;
}

/**
 * Evaluate a single things_to_do record.
 * @param {object} record  a things_to_do row (snake_case columns)
 * @param {object} [opts]
 * @param {string[]} [opts.marketplaceNames]  normalised merchant names
 * @param {number} [opts.overlapThreshold=0.6]
 * @param {Date}   [opts.now]  injectable "today" for deterministic tests
 * @returns {{score:number, flags:Array, marketplaceMatch:object|null,
 *            categoryOk:boolean, hasError:boolean}}
 */
export function evaluateRecord(record = {}, opts = {}) {
  const { marketplaceNames = [], overlapThreshold = 0.6, now = new Date() } = opts;
  const flags = [];
  const add = (level, code, message) => flags.push({ level, code, message });

  // ── Accuracy: required fields & valid enums ──────────────────────────
  if (!norm(record.title)) add('error', 'missing_title', 'Title is empty.');
  if (!norm(record.slug)) add('error', 'missing_slug', 'Slug is empty.');
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug))
    add('warn', 'bad_slug', `Slug "${record.slug}" is not URL-safe kebab-case.`);

  if (!record.type) add('warn', 'missing_type', 'No type set.');
  else if (!VALID_TYPES.includes(norm(record.type)))
    add('error', 'bad_type', `type "${record.type}" is not one of: ${VALID_TYPES.join(', ')}.`);

  if (record.price_type && !VALID_PRICE_TYPES.includes(norm(record.price_type)))
    add('error', 'bad_price_type', `price_type "${record.price_type}" is invalid.`);
  if (record.indoor_outdoor && !VALID_INDOOR_OUTDOOR.includes(norm(record.indoor_outdoor)))
    add('warn', 'bad_indoor_outdoor', `indoor_outdoor "${record.indoor_outdoor}" is invalid.`);

  if (!norm(record.description) && !norm(record.long_description))
    add('warn', 'missing_description', 'No description or long_description.');
  if (!norm(record.hero_image_url) && !(record.image_urls && record.image_urls.length))
    add('warn', 'missing_image', 'No hero image.');
  if (!norm(record.area) && !norm(record.venue_name))
    add('warn', 'missing_location', 'No area or venue.');
  if (record.age_min == null && record.age_max == null && !(record.age_band && record.age_band.length))
    add('warn', 'missing_age', 'No age range or age band.');
  if (!norm(record.visit_site_url) && !norm(record.provider_url) && !norm(record.source_url))
    add('warn', 'missing_link', 'No outbound link (visit/provider/source url).');

  // ── Accuracy: date sanity ────────────────────────────────────────────
  const start = parseDate(record.start_date);
  const end = parseDate(record.end_date);
  if (record.start_date && !start) add('error', 'bad_start_date', `Unparseable start_date "${record.start_date}".`);
  if (record.end_date && !end) add('error', 'bad_end_date', `Unparseable end_date "${record.end_date}".`);
  if (start && end && end < start) add('error', 'date_order', 'end_date is before start_date.');
  // Past events are an expiry signal, not an accuracy error — surfaced as info.
  if (end && end < now) add('info', 'already_ended', `Ended ${record.end_date} (candidate to expire).`);

  // ── Accuracy: price consistency ──────────────────────────────────────
  const priceText = norm(record.price_display);
  if (priceText) {
    const pt = norm(record.price_type);
    if (pt === 'free' && FREE_TO_MIXED_HINTS.some((re) => re.test(priceText)))
      add('warn', 'price_free_looks_mixed', `price_type=free but price_display mentions a charge: "${record.price_display}".`);
    if (pt === 'paid' && PAID_TO_MIXED_HINTS.some((re) => re.test(priceText)))
      add('warn', 'price_paid_looks_mixed', `price_type=paid but price_display mentions a free option: "${record.price_display}".`);
  }

  // ── Category fit: is this a one-off kids experience? ─────────────────
  const haystack = `${norm(record.title)} ${norm(record.description)} ${norm(record.long_description)} ${norm(record.recurrence)}`;
  const domainHit = MARKETPLACE_DOMAIN_HINTS.find((re) => re.test(haystack));
  let categoryOk = true;
  if (domainHit) {
    categoryOk = false;
    add('warn', 'category_marketplace_domain',
      `Reads like a recurring class/camp/lesson (matched ${domainHit}). The marketplace owns those, not Summer.`);
  }

  // ── "Not already on www.jungle.baby": merchant overlap ───────────────
  const matchTitle = bestMarketplaceMatch(record.title, marketplaceNames);
  const matchProvider = bestMarketplaceMatch(record.provider_name, marketplaceNames);
  const marketplaceMatch =
    [matchTitle, matchProvider].filter(Boolean).sort((a, b) => b.score - a.score)[0] || null;
  if (marketplaceMatch && marketplaceMatch.score >= overlapThreshold) {
    categoryOk = false;
    // Exact full-name equality is a confident duplicate (error); a partial
    // overlap is a heads-up for the reviewer (warn).
    const level = marketplaceMatch.kind === 'exact' ? 'error' : 'warn';
    const how = marketplaceMatch.kind === 'exact' ? 'matches' : 'resembles';
    add(level, 'marketplace_overlap',
      `Provider ${how} marketplace merchant "${marketplaceMatch.name}" (${marketplaceMatch.score.toFixed(2)}). May already be on www.jungle.baby.`);
  }

  // ── Score: 1.0 minus weighted penalties, floored at 0 ────────────────
  const penalty = flags.reduce((sum, f) => sum + (f.level === 'error' ? 0.34 : f.level === 'warn' ? 0.12 : 0), 0);
  const score = Math.max(0, Math.min(1, 1 - penalty));
  const hasError = flags.some((f) => f.level === 'error');

  // Auto-publish gate: a record may skip human review and go live only if it
  // has no hard (error-level) flags AND is on-category (not a marketplace
  // duplicate / not a recurring class-camp). Everything else is held in the
  // review queue. This is the "auto-publish except hard errors" policy.
  const autoPublishable = !hasError && categoryOk;

  return { score: Number(score.toFixed(2)), flags, marketplaceMatch, categoryOk, hasError, autoPublishable };
}

/** Evaluate a batch and return per-record reports plus a summary. */
export function evaluateBatch(records, opts = {}) {
  const reports = records.map((r) => ({
    id: r.id, slug: r.slug, title: r.title, ...evaluateRecord(r, opts),
  }));
  const summary = {
    total: reports.length,
    clean: reports.filter((r) => r.flags.length === 0).length,
    withErrors: reports.filter((r) => r.hasError).length,
    offCategory: reports.filter((r) => !r.categoryOk).length,
    marketplaceOverlaps: reports.filter((r) => r.flags.some((f) => f.code === 'marketplace_overlap')).length,
  };
  return { reports, summary };
}
