#!/usr/bin/env node
// ============================================================
// ingest.mjs — eval-gated ingestion of new things-to-do.
//
// Reads a CSV of new events (the weekly routine's output/results_new.csv
// from jungle-summer-extract), evaluates each, and routes it:
//   • clean + on-category (eval.autoPublishable) → approved + active  (LIVE)
//   • anything with a hard error / off-category / marketplace dup
//                                              → needs_review + draft  (HELD)
// Held records show up on /admin/review for individual or bulk approval.
// This is the "auto-publish except hard errors" policy.
//
//   node scripts/ingest.mjs <path/to/results_new.csv>            # dry run
//   node scripts/ingest.mjs <path/to/results_new.csv> --apply    # write
//
// Existing slugs are skipped (idempotent re-runs).
// ============================================================
import { readFileSync } from 'node:fs';
import { rest, loadMarketplaceNames } from './_supabase.mjs';
import { evaluateRecord } from '../lib/eval.mjs';

const file = process.argv[2];
const apply = process.argv.includes('--apply');
const newOnly = process.argv.includes('--new-only');
if (!file) { console.error('Usage: node scripts/ingest.mjs <csv> [--new-only] [--apply]'); process.exit(1); }

// ── Minimal CSV parser (handles quoted fields, commas, escaped quotes) ──
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

const slugify = (s) => (s || '').toLowerCase().trim()
  .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const arr = (v) => (v ? v.split(/[;,]/).map((x) => x.trim()).filter(Boolean) : null);
const num = (v) => (v === '' || v == null ? null : (isNaN(Number(v)) ? null : Number(v)));
const bool = (v) => (v === 'true' ? true : v === 'false' ? false : null);

// CSV → things_to_do columns (drops non-DB columns like price_free_for/first_seen).
function toRecord(r) {
  return {
    slug: slugify(r.title),
    title: r.title || null,
    provider_name: r.provider_name || null,
    provider_url: r.provider_url || null,
    description: r.description || null,
    type: r.type || null,
    categories: arr(r.categories),
    price_type: r.price_type || null,
    price_min: num(r.price_min),
    price_max: num(r.price_max),
    price_display: r.price_display || null,
    age_min: num(r.age_min),
    age_max: num(r.age_max),
    age_band: arr(r.age_band),
    area: r.area || null,
    venue_name: r.venue_name || null,
    venue_address: r.venue_address || null,
    latitude: num(r.latitude),
    longitude: num(r.longitude),
    start_date: r.start_date || null,
    end_date: r.end_date || null,
    recurrence: r.recurrence || null,
    booking_required: bool(r.booking_required),
    indoor_outdoor: r.indoor_outdoor || null,
    hero_image_url: r.hero_image_url || null,
    source_name: r.source_name || null,
    source_url: r.source_url || null,
    confidence_score: num(r.confidence_score),
  };
}

const marketplaceNames = loadMarketplaceNames();
let raw = parseCSV(readFileSync(file, 'utf8'));
// --new-only: keep just this run's delta. The CSV's first_seen column is
// stamped with the run date for genuinely-new titles; the latest first_seen
// present is the most recent batch. Lets the routine ingest the geocoded delta
// straight from the full results.csv.
if (newOnly) {
  const latest = raw.map((r) => r.first_seen).filter(Boolean).sort().at(-1);
  raw = raw.filter((r) => r.first_seen === latest);
  console.log(`--new-only: latest first_seen=${latest} → ${raw.length} delta rows`);
}
const rows = raw.map(toRecord).filter((r) => r.slug);

// Skip slugs that already exist (idempotent).
const slugs = rows.map((r) => r.slug);
const existing = new Set(
  (await rest(`/things_to_do?select=slug&slug=in.(${slugs.map((s) => `"${s}"`).join(',')})`)).map((r) => r.slug)
);

const live = [], held = [], skipped = [];
for (const r of rows) {
  if (existing.has(r.slug)) { skipped.push(r); continue; }
  const ev = evaluateRecord(r, { marketplaceNames });
  if (ev.autoPublishable) { live.push({ ...r, review_status: 'approved', status: 'active' }); }
  else { held.push({ ...r, review_status: 'needs_review', status: 'draft' }); }
}

console.log(`\nEval-gated ingest of ${file}`);
console.log(`  parsed:               ${rows.length}`);
console.log(`  already in DB (skip): ${skipped.length}`);
console.log(`  → auto-publish LIVE:  ${live.length}`);
console.log(`  → held for review:    ${held.length}\n`);
if (held.length) {
  console.log('Held for review (first 15):');
  for (const r of held.slice(0, 15)) console.log(`  • ${r.title}`);
  console.log('');
}

if (!apply) { console.log('Dry run. Re-run with --apply to insert.\n'); process.exit(0); }

const insert = [...live, ...held];
if (!insert.length) { console.log('Nothing new to insert.\n'); process.exit(0); }
const inserted = await rest('/things_to_do', {
  method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(insert),
});
console.log(`Inserted ${inserted.length} record(s): ${live.length} live, ${held.length} in review queue.\n`);
