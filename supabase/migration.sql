-- Jungle Summer: Things to Do
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- ── Enums ──────────────────────────────────────────────────────────────────

create type thing_type as enum (
  'festival', 'show', 'museum', 'outdoor', 'library', 'attraction', 'free_event'
);

create type price_type as enum ('free', 'paid', 'mixed');

create type indoor_outdoor_type as enum ('indoor', 'outdoor', 'both');

create type review_status_type as enum ('needs_review', 'approved', 'rejected');

create type thing_status as enum ('active', 'expired', 'draft', 'archived');

-- ── things_to_do ───────────────────────────────────────────────────────────

create table things_to_do (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  title             text not null,
  provider_name     text,
  provider_url      text,
  description       text,
  long_description  text,
  type              thing_type,
  categories        text[],
  price_type        price_type,
  price_min         numeric,
  price_max         numeric,
  price_display     text,
  age_min           int,
  age_max           int,
  age_band          text[],
  area              text,
  venue_name        text,
  venue_address     text,
  latitude          numeric,
  longitude         numeric,
  start_date        date,
  end_date          date,
  recurrence        text,
  booking_required  boolean,
  indoor_outdoor    indoor_outdoor_type,
  hero_image_url    text,
  image_urls        text[] default '{}',
  source_name       text,
  source_url        text,
  visit_site_url    text,
  raw_payload       jsonb,
  review_status     review_status_type not null default 'needs_review',
  confidence_score  numeric check (confidence_score between 0 and 1),
  status            thing_status not null default 'draft',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  last_scraped_at   timestamptz
);

-- auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger things_to_do_updated_at
  before update on things_to_do
  for each row execute function set_updated_at();

-- ── share_logs ─────────────────────────────────────────────────────────────

create type share_channel as enum ('email', 'sms');
create type share_status as enum ('sent', 'failed', 'bounced');

create table share_logs (
  id               uuid primary key default gen_random_uuid(),
  thing_to_do_id   uuid references things_to_do(id) on delete cascade,
  channel          share_channel not null,
  recipient_hash   text not null,
  ip_address_hash  text,
  status           share_status not null default 'sent',
  created_at       timestamptz not null default now()
);

-- ── Row Level Security ─────────────────────────────────────────────────────

alter table things_to_do enable row level security;
alter table share_logs enable row level security;

-- Public: read only active + approved records
create policy "public read active things"
  on things_to_do for select
  using (status = 'active' and review_status = 'approved');

-- share_logs: no public read (server-side only via service role)

-- ── Indexes ────────────────────────────────────────────────────────────────

create index on things_to_do (status, review_status);
create index on things_to_do (area);
create index on things_to_do (type);
create index on things_to_do (price_type);
create index on things_to_do (start_date, end_date);
create index on things_to_do (slug);
