#!/usr/bin/env node
// ============================================================
// expire.mjs — flip past active listings to status='expired'.
//
// Removes ended events from the public site (RLS only exposes
// active+approved). Targets ONLY status=active rows with a non-null
// end_date strictly before today.
//
//   node scripts/expire.mjs            # dry run: list what would expire
//   node scripts/expire.mjs --apply    # actually expire them
//
// In production this runs via the Vercel cron route app/api/cron/expire.
// This script is the manual / local equivalent.
// ============================================================
import { rest } from './_supabase.mjs';

const apply = process.argv.includes('--apply');
const today = new Date().toISOString().slice(0, 10);

const candidates = await rest(
  `/things_to_do?select=id,slug,title,end_date&status=eq.active&end_date=not.is.null&end_date=lt.${today}&order=end_date.asc`
);

console.log(`\nExpiry check (today=${today}) — ${candidates.length} active listing(s) have ended:\n`);
for (const c of candidates) console.log(`  ${c.end_date}  ${c.title || c.slug || c.id}`);

if (!candidates.length) { console.log('\nNothing to expire.\n'); process.exit(0); }

if (!apply) {
  console.log(`\nDry run. Re-run with --apply to set status='expired' on these ${candidates.length} record(s).\n`);
  process.exit(0);
}

const updated = await rest(
  `/things_to_do?status=eq.active&end_date=not.is.null&end_date=lt.${today}`,
  { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'expired' }) }
);
console.log(`\nExpired ${updated.length} record(s).\n`);
