import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client using the service-role key. Bypasses RLS so
// the review tooling can see and mutate draft / needs_review rows that the
// public anon key cannot. NEVER import this into a client component.
let cached = null;
export function getAdminClient() {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service credentials missing (SUPABASE_SERVICE_KEY).');
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}

// Validate the admin secret sent by the review page. The secret is checked
// here, server-side, on every request — the client password gates only the
// React view and is not trusted.
export function isAuthorized(request) {
  const expected = process.env.ADMIN_REVIEW_SECRET;
  if (!expected) return false;
  const got = request.headers.get('x-admin-secret') || '';
  // Constant-time-ish compare.
  if (got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
