#!/usr/bin/env node
// ============================================================
// analyze.mjs — run the eval over Summer listings and report.
//
// Default: analyse the review queue (review_status=needs_review) — the
// "new events" awaiting a decision. Pass --all to analyse every record,
// or --status=approved to audit what's already live.
//
//   node scripts/analyze.mjs                 # needs_review queue
//   node scripts/analyze.mjs --all
//   node scripts/analyze.mjs --status=approved
//   node scripts/analyze.mjs --json          # machine-readable report
//
// READ-ONLY: prints a report, never mutates the database.
// ============================================================
import { rest, loadMarketplaceNames } from './_supabase.mjs';
import { evaluateBatch } from '../lib/eval.mjs';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const all = args.includes('--all');
const statusArg = (args.find((a) => a.startsWith('--status=')) || '').split('=')[1];

let query = '/things_to_do?select=*&order=created_at.desc';
if (!all) {
  if (statusArg) query += `&review_status=eq.${statusArg}`;
  else query += '&review_status=eq.needs_review';
}

const records = await rest(query);
const marketplaceNames = loadMarketplaceNames();
const { reports, summary } = evaluateBatch(records, { marketplaceNames });

if (asJson) {
  process.stdout.write(JSON.stringify({ summary, reports }, null, 2) + '\n');
  process.exit(0);
}

const C = { reset: '\x1b[0m', red: '\x1b[31m', yellow: '\x1b[33m', dim: '\x1b[2m', green: '\x1b[32m', bold: '\x1b[1m' };
const tag = (lvl) =>
  lvl === 'error' ? `${C.red}ERROR${C.reset}` : lvl === 'warn' ? `${C.yellow}WARN ${C.reset}` : `${C.dim}info ${C.reset}`;

console.log(`\n${C.bold}Jungle Summer — listing audit${C.reset}  (${marketplaceNames.length} marketplace names loaded)\n`);
console.log(`  scope:                ${all ? 'all records' : `review_status=${statusArg || 'needs_review'}`}`);
console.log(`  total:                ${summary.total}`);
console.log(`  clean (no flags):     ${C.green}${summary.clean}${C.reset}`);
console.log(`  with errors:          ${C.red}${summary.withErrors}${C.reset}`);
console.log(`  off-category:         ${summary.offCategory}`);
console.log(`  marketplace overlaps: ${summary.marketplaceOverlaps}\n`);

const flagged = reports.filter((r) => r.flags.length).sort((a, b) => a.score - b.score);
for (const r of flagged) {
  console.log(`${C.bold}${r.score.toFixed(2)}${C.reset}  ${r.title || '(untitled)'}  ${C.dim}[${r.slug || r.id}]${C.reset}`);
  for (const f of r.flags) console.log(`      ${tag(f.level)} ${f.message}`);
}
console.log(`\n${flagged.length} of ${summary.total} records have at least one flag.\n`);
