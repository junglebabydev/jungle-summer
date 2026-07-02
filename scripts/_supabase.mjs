// Shared Supabase REST helper for the audit scripts (service-role).
// Reads SUPABASE_URL + SUPABASE_SERVICE_KEY from supabase/.env.local (or the
// process env). Service role bypasses RLS so we can see/update draft +
// needs_review rows that the public anon key cannot.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = { ...process.env };
  try {
    const txt = readFileSync(join(here, '..', 'supabase', '.env.local'), 'utf8');
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* env file optional */ }
  return env;
}

const env = loadEnv();
export const SUPABASE_URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY (supabase/.env.local).');
  process.exit(1);
}

const base = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1`;
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

export async function rest(path, init = {}) {
  const res = await fetch(`${base}${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

export function loadMarketplaceNames() {
  try {
    return JSON.parse(readFileSync(join(here, '..', 'lib', 'marketplace-names.json'), 'utf8')).names || [];
  } catch {
    return [];
  }
}
