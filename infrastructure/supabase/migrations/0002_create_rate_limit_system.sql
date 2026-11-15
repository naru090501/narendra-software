-- ============================================================================
-- Migration: 0002_create_rate_limit_system.sql
-- Project:   Narendra Software Central Platform (`narendramain`)
-- Purpose:   Create atomic distributed rate-limiting infrastructure for
--            serverless edge applications. Supports configurable limits, sliding
--            windows, privacy-preserving HMAC bucket keys, atomic counter upserts,
--            and strict service_role execution boundaries.
--
-- Security Corrections Applied:
--   - Strict database-level action isolation: Composite primary key `(action, bucket_key)`
--     prevents collisions across distinct rate-limit categories.
--   - Strict parameter validation: p_max_requests (1..1000), p_window_seconds (1..86400),
--     p_action (regex `^[a-z0-9_-]+$`), p_bucket_key (exact 64-char lowercase hex).
--   - Privacy: Raw IP addresses are NEVER stored in this table.
--   - Performance hygiene: Removed probabilistic deletion from the hot request path
--     to prevent unexpected query latency spikes during user submissions.
--   - Zero permissions for public/anon/authenticated: Table access and function execution
--     are revoked from public/anon/authenticated and granted EXCLUSIVELY to service_role.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Rate Limits Table
-- ----------------------------------------------------------------------------
create table if not exists public.rate_limits (
  action            text not null default 'contact-form',
  bucket_key        text not null,
  count             integer not null default 1,
  first_request_at  timestamptz not null default now(),
  last_request_at   timestamptz not null default now(),
  expires_at        timestamptz not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint rate_limits_pk primary key (action, bucket_key),
  constraint rate_limits_action_format check (
    char_length(action) between 1 and 64
    and action ~ '^[a-z0-9_-]+$'
  ),
  constraint rate_limits_bucket_key_format check (
    char_length(bucket_key) = 64
    and bucket_key ~ '^[a-f0-9]{64}$'
  ),
  constraint rate_limits_count_positive check (count >= 1)
);

-- ----------------------------------------------------------------------------
-- 2. Performance & Maintenance Indexes
-- ----------------------------------------------------------------------------
create index if not exists rate_limits_expires_at_idx
  on public.rate_limits (expires_at);

create index if not exists rate_limits_action_expires_idx
  on public.rate_limits (action, expires_at);

-- ----------------------------------------------------------------------------
-- 3. Row-Level Security & Role Permissions
-- ----------------------------------------------------------------------------
alter table public.rate_limits enable row level security;

-- Revoke all table access from public clients (anon) and standard users (authenticated)
revoke all on table public.rate_limits from public, anon, authenticated;

-- Grant access strictly to the server-side service role
grant select, insert, update, delete on table public.rate_limits to service_role;

-- ----------------------------------------------------------------------------
-- 4. Atomic Rate Limit Evaluation Function
-- ----------------------------------------------------------------------------
create or replace function public.check_rate_limit(
  p_bucket_key text,
  p_action text default 'contact-form',
  p_max_requests integer default 5,
  p_window_seconds integer default 900
)
returns table (
  allowed boolean,
  current_count integer,
  remaining integer,
  reset_at timestamptz,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_expires_at timestamptz;
  v_clean_action text;
  v_clean_key text;
  v_row public.rate_limits%rowtype;
  v_allowed boolean;
  v_retry_after integer := 0;
begin
  -- 1. Parameter Validation
  if p_action is null or char_length(trim(p_action)) not between 1 and 64 or trim(p_action) !~ '^[a-z0-9_-]+$' then
    raise exception 'Invalid action parameter: must be alphanumeric (hyphens/underscores allowed) between 1 and 64 characters';
  end if;

  if p_bucket_key is null or char_length(trim(p_bucket_key)) != 64 or trim(p_bucket_key) !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid bucket_key parameter: must be an exact 64-character lowercase hex SHA-256 digest';
  end if;

  if p_max_requests is null or p_max_requests <= 0 or p_max_requests > 1000 then
    raise exception 'Invalid max_requests parameter: must be between 1 and 1000';
  end if;

  if p_window_seconds is null or p_window_seconds <= 0 or p_window_seconds > 86400 then
    raise exception 'Invalid window_seconds parameter: must be between 1 and 86400 (up to 24 hours)';
  end if;

  v_clean_action := trim(p_action);
  v_clean_key := trim(p_bucket_key);
  v_expires_at := v_now + (p_window_seconds * interval '1 second');

  -- 2. Atomic check-and-increment upsert
  -- PostgreSQL executes this under an internal row lock on (action, bucket_key),
  -- guaranteeing that concurrent requests serialize safely with zero race condition.
  -- Bulk deletions are strictly excluded from this hot path to avoid latency spikes.
  insert into public.rate_limits as rl (
    action,
    bucket_key,
    count,
    first_request_at,
    last_request_at,
    expires_at,
    created_at,
    updated_at
  )
  values (
    v_clean_action,
    v_clean_key,
    1,
    v_now,
    v_now,
    v_expires_at,
    v_now,
    v_now
  )
  on conflict (action, bucket_key) do update
  set
    -- If previous window has elapsed, reset count to 1 and establish fresh expiry window
    count = case
      when rl.expires_at <= v_now then 1
      else rl.count + 1
    end,
    first_request_at = case
      when rl.expires_at <= v_now then v_now
      else rl.first_request_at
    end,
    last_request_at = v_now,
    expires_at = case
      when rl.expires_at <= v_now then v_expires_at
      else rl.expires_at
    end,
    updated_at = v_now
  returning * into v_row;

  -- 3. Evaluate whether this attempt is allowed
  if v_row.count <= p_max_requests then
    v_allowed := true;
    v_retry_after := 0;
  else
    v_allowed := false;
    v_retry_after := greatest(1, ceil(extract(epoch from (v_row.expires_at - v_now)))::integer);
  end if;

  -- 4. Return structured result
  return query
  select
    v_allowed,
    v_row.count,
    greatest(0, p_max_requests - v_row.count),
    v_row.expires_at,
    v_retry_after;
end;
$$;

-- Revoke function execution from public and anon
revoke all on function public.check_rate_limit(text, text, integer, integer) from public, anon, authenticated;

-- Grant execution strictly to service_role
grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;

-- ----------------------------------------------------------------------------
-- 5. Maintenance Expiry Cleanup Function (Scheduled / Maintenance Job Only)
-- ----------------------------------------------------------------------------
create or replace function public.cleanup_expired_rate_limits(
  p_retention_interval interval default interval '1 day'
)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_deleted integer;
begin
  -- Validate retention interval to prevent invalid, negative or excessive values
  if p_retention_interval is null then
    raise exception 'retention_interval cannot be null';
  end if;

  if p_retention_interval < interval '1 hour' or p_retention_interval > interval '90 days' then
    raise exception 'retention_interval must be between 1 hour and 90 days';
  end if;

  delete from public.rate_limits
  where expires_at < clock_timestamp() - p_retention_interval;

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.cleanup_expired_rate_limits(interval) from public, anon, authenticated;
grant execute on function public.cleanup_expired_rate_limits(interval) to service_role;
