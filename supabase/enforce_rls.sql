-- ============================================================
-- enforce_rls.sql — close the public-read hole on things_to_do.
--
-- WHY: verification on 2026-06-29 found the anon (public) key could read
-- ALL 396 rows directly via the REST API, including draft / needs_review /
-- rejected records and their raw_payload. RLS was not effectively enforced.
-- The Summer site itself is now gated at the app layer (Browse.jsx filters
-- review_status=approved), but the raw REST endpoint was still open. This
-- restores the intended database-level gate as defense-in-depth.
--
-- Run in Supabase Studio → SQL Editor. Idempotent.
-- After running, re-test:  the anon key must see ~220 rows, not 396.
-- ============================================================

alter table things_to_do enable row level security;

-- Drop EVERY existing policy by name (we don't assume what's there — the
-- permissive policy letting anon read all 396 rows had an unknown name).
-- This guarantees no stray permissive policy survives to keep the table open,
-- since Postgres combines permissive policies with OR.
do $$
declare p record;
begin
  for p in select polname from pg_policy where polrelid = 'things_to_do'::regclass loop
    execute format('drop policy if exists %I on things_to_do', p.polname);
  end loop;
end $$;

-- The ONLY public-readable rows: approved AND (active or expired).
-- Expired stays readable so the site's "Show expired" toggle keeps working;
-- draft / needs_review / rejected / archived are never exposed to anon.
create policy "public read reviewed things"
  on things_to_do for select
  to anon
  using (review_status = 'approved' and status in ('active', 'expired'));

-- Writes remain service-role only (the review API uses the service key,
-- which bypasses RLS). No insert/update/delete policy for anon is created.
