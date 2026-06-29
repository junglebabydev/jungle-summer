// ============================================================
// scripts/eval.test.mjs — automated eval/accuracy tests
// Run with:  node --test scripts/eval.test.mjs
//
// Proves the evaluator flags the failure modes we care about: bad enums,
// broken dates, price mistags, off-category (marketplace-domain) listings,
// and overlap with real www.jungle.baby merchants. A clean, on-category
// event must pass with no flags.
// ============================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRecord, evaluateBatch } from '../lib/eval.mjs';

const NOW = new Date('2026-06-28T00:00:00Z'); // deterministic "today"
const MARKET = ['cristofori music school', 'a2 parkour gym sg', 'smigy playground'];
const opts = { marketplaceNames: MARKET, now: NOW };

// A clean, on-category, future-dated one-off experience.
const goodEvent = {
  slug: 'coral-keepers-2026',
  title: "Children's Season 2026: The Coral Keepers",
  provider_name: 'Childrens Museum Singapore',
  description: 'An immersive play-based experience about coral reefs.',
  type: 'show',
  price_type: 'paid',
  price_display: 'S$20',
  age_band: ['7-12'],
  area: 'Central',
  venue_name: 'Singapore Maritime Gallery',
  hero_image_url: 'https://example.com/coral.jpg',
  start_date: '2026-07-19',
  end_date: '2026-07-27',
  visit_site_url: 'https://heritage.sg/x',
};

const codes = (rep) => rep.flags.map((f) => f.code);

test('clean on-category event passes with no flags', () => {
  const rep = evaluateRecord(goodEvent, opts);
  assert.deepEqual(rep.flags, [], 'expected zero flags, got: ' + JSON.stringify(rep.flags));
  assert.equal(rep.categoryOk, true);
  assert.equal(rep.hasError, false);
  assert.equal(rep.score, 1);
});

test('invalid enum type is an error', () => {
  const rep = evaluateRecord({ ...goodEvent, type: 'workshop' }, opts);
  assert.ok(codes(rep).includes('bad_type'));
  assert.equal(rep.hasError, true);
});

test('missing title and slug are errors', () => {
  const rep = evaluateRecord({ ...goodEvent, title: '', slug: '' }, opts);
  assert.ok(codes(rep).includes('missing_title'));
  assert.ok(codes(rep).includes('missing_slug'));
});

test('end before start is a date_order error', () => {
  const rep = evaluateRecord({ ...goodEvent, start_date: '2026-06-27', end_date: '2026-06-19' }, opts);
  assert.ok(codes(rep).includes('date_order'));
});

test('unparseable date is an error', () => {
  const rep = evaluateRecord({ ...goodEvent, start_date: 'sometime in June' }, opts);
  assert.ok(codes(rep).includes('bad_start_date'));
});

test('free record with a dollar amount is flagged as looks-mixed', () => {
  const rep = evaluateRecord(
    { ...goodEvent, price_type: 'free', price_display: 'Free, but $5 materials fee applies' }, opts);
  assert.ok(codes(rep).includes('price_free_looks_mixed'));
});

test('past event surfaces an expiry candidate (info, not error)', () => {
  const rep = evaluateRecord({ ...goodEvent, start_date: '2026-05-01', end_date: '2026-05-10' }, opts);
  assert.ok(codes(rep).includes('already_ended'));
  assert.equal(rep.hasError, false);
});

test('recurring class is flagged off-category', () => {
  const rep = evaluateRecord(
    { ...goodEvent, title: 'Weekly Piano Lessons', description: 'A 10-week term enrichment class.' }, opts);
  assert.ok(codes(rep).includes('category_marketplace_domain'));
  assert.equal(rep.categoryOk, false);
});

test('camp is flagged off-category (camps live in the marketplace)', () => {
  const rep = evaluateRecord(
    { ...goodEvent, title: 'June Holiday Coding Camp', description: 'A fun school holiday camp.' }, opts);
  assert.ok(codes(rep).includes('category_marketplace_domain'));
});

test('overlap with a real marketplace merchant is flagged', () => {
  const rep = evaluateRecord(
    { ...goodEvent, title: 'Cristofori Music School Recital', provider_name: 'Cristofori Music School' }, opts);
  assert.ok(codes(rep).includes('marketplace_overlap'));
  assert.equal(rep.categoryOk, false);
});

test('provider that is NOT a marketplace merchant does not overlap-flag', () => {
  const rep = evaluateRecord({ ...goodEvent, provider_name: 'Gardens by the Bay' }, opts);
  assert.ok(!codes(rep).includes('marketplace_overlap'));
});

test('evaluateBatch summarises counts', () => {
  const { summary } = evaluateBatch(
    [goodEvent, { ...goodEvent, slug: 'x', type: 'workshop' }, { ...goodEvent, slug: 'y', title: 'Weekly Class' }],
    opts);
  assert.equal(summary.total, 3);
  assert.equal(summary.clean, 1);
  assert.ok(summary.withErrors >= 1);
  assert.ok(summary.offCategory >= 1);
});
