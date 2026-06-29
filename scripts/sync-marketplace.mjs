#!/usr/bin/env node
// ============================================================
// sync-marketplace.mjs
// Pulls the live www.jungle.baby sitemap, extracts every marketplace
// merchant name from the /merchant/{id}/{slug} URLs, and writes a
// normalised, de-duplicated snapshot to lib/marketplace-names.json.
//
// The eval (lib/eval.mjs) reads that snapshot to flag Summer listings
// that overlap with merchants already on the Jungle marketplace. We
// cache to a file so the eval stays deterministic and runs offline —
// re-run this script to refresh the snapshot.
//
//   node scripts/sync-marketplace.mjs
// ============================================================
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SITEMAP_URL = 'https://www.jungle.baby/sitemap.xml';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'marketplace-names.json');

// Slug → readable name: "cristofori-music-school" → "cristofori music school"
const slugToName = (slug) =>
  decodeURIComponent(slug).replace(/-/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

async function main() {
  process.stdout.write(`Fetching ${SITEMAP_URL} ...\n`);
  const res = await fetch(SITEMAP_URL, { headers: { 'user-agent': 'jungle-summer-audit/1.0' } });
  if (!res.ok) throw new Error(`sitemap fetch failed: HTTP ${res.status}`);
  const xml = await res.text();

  // /merchant/{id}/{slug}?...  — capture the slug segment only.
  const re = /\/merchant\/\d+\/([^?<\s"]+)/g;
  const names = new Set();
  let m;
  while ((m = re.exec(xml)) !== null) {
    const name = slugToName(m[1]);
    if (name) names.add(name);
  }

  const sorted = [...names].sort();
  const payload = {
    source: SITEMAP_URL,
    generated_at: new Date().toISOString(),
    count: sorted.length,
    names: sorted,
  };
  await writeFile(OUT, JSON.stringify(payload, null, 2) + '\n');
  process.stdout.write(`Wrote ${sorted.length} unique merchant names to ${OUT}\n`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
