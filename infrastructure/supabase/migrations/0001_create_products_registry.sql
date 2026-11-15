-- ============================================================================
-- Migration: 0001_create_products_registry.sql
-- Project:   Narendra Software Central Platform (`narendramain`)
-- Purpose:   Create the canonical `public.products` registry with strict
--            constraints, lookup indexes, audit timestamps, and RLS policies.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Table Definition
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  slug                  text not null,
  description           text not null,
  short_description     text,
  category              text not null,
  url                   text,
  documentation_url     text,
  icon_url              text,
  status                text not null default 'planned',
  version               text not null default '0.1.0',
  supported_platforms   text[] not null default array['web']::text[],
  pricing_model         text not null default 'free',
  requires_registration boolean not null default false,
  requires_cloud        boolean not null default false,
  is_featured           boolean not null default false,
  sort_order            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint products_slug_unique unique (slug),
  constraint products_name_nonempty check (char_length(btrim(name)) between 1 and 120),
  constraint products_description_nonempty check (char_length(btrim(description)) between 1 and 2000),
  constraint products_short_description_valid check (
    short_description is null or char_length(btrim(short_description)) between 1 and 240
  ),
  constraint products_slug_format check (
    char_length(slug) between 1 and 100
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint products_category_valid check (
    category in (
      'developer-toolbox',
      'document-tools',
      'image-tools',
      'security-tools',
      'ai-tools',
      'windows-utilities'
    )
  ),
  constraint products_status_valid check (
    status in (
      'planned',
      'in_development',
      'in-development',
      'beta',
      'released',
      'live',
      'deprecated',
      'archived'
    )
  ),
  constraint products_pricing_model_valid check (
    pricing_model in (
      'free',
      'open-source',
      'freemium',
      'paid'
    )
  ),
  constraint products_supported_platforms_valid check (
    supported_platforms <@ array['web', 'windows', 'linux', 'macos', 'android', 'ios']::text[]
    and cardinality(supported_platforms) >= 1
  ),
  constraint products_version_format check (
    char_length(version) between 1 and 30
    and version ~ '^[0-9]+(\.[0-9]+)+(-[a-zA-Z0-9.-]+)?$'
  ),
  constraint products_url_valid check (
    url is null
    or (
      char_length(url) <= 500
      and url ~ '^https?://[A-Za-z0-9.-]+(?::[0-9]+)?(?:/[^\s]*)?$'
    )
  ),
  constraint products_documentation_url_valid check (
    documentation_url is null
    or (
      char_length(documentation_url) <= 500
      and (
        documentation_url ~ '^https?://[A-Za-z0-9.-]+(?::[0-9]+)?(?:/[^\s]*)?$'
        or documentation_url ~ '^/[^/\s][^\s]*$'
      )
    )
  ),
  constraint products_icon_url_valid check (
    icon_url is null
    or (
      char_length(icon_url) <= 500
      and (
        icon_url ~ '^https?://[A-Za-z0-9.-]+(?::[0-9]+)?(?:/[^\s]*)?$'
        or icon_url ~ '^/[^/\s][^\s]*$'
      )
    )
  ),
  constraint products_sort_order_nonnegative check (sort_order >= 0)
);

comment on table public.products is
  'Central product registry for Narendra Software applications and utilities.';

-- ----------------------------------------------------------------------------
-- 2. Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_products_active_sort
  on public.products (sort_order asc, name asc)
  where status in ('planned', 'in_development', 'in-development', 'beta', 'released', 'live');

create index if not exists idx_products_category_status
  on public.products (category, status);

create index if not exists idx_products_featured
  on public.products (sort_order asc)
  where is_featured = true and status in ('planned', 'in_development', 'in-development', 'beta', 'released', 'live');

-- ----------------------------------------------------------------------------
-- 3. Automatic `updated_at` Maintenance & `created_at` Immutability
-- ----------------------------------------------------------------------------
create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.created_at = old.created_at;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row
  execute function public.set_products_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Row Level Security (RLS) & Least-Privilege Grants
-- ----------------------------------------------------------------------------
alter table public.products enable row level security;

-- Revoke all table access from public, anon, and authenticated by default
revoke all on table public.products from public;
revoke all on table public.products from anon;
revoke all on table public.products from authenticated;

-- Explicit least-privilege table grants:
-- 1. Visitors and authenticated users may query rows allowed by RLS policies
grant select on table public.products to anon, authenticated;

-- 2. Server-side administrative processes (service_role) retain full database privileges
grant select, insert, update, delete on table public.products to service_role;

-- 3. Authenticated administrative users may execute write operations gated by RLS policies below
grant select, insert, update, delete on table public.products to authenticated;

-- Public visitors (anon + authenticated) may read active product records.
drop policy if exists products_public_read on public.products;
create policy products_public_read
  on public.products
  for select
  to anon, authenticated
  using (status in ('planned', 'in_development', 'in-development', 'beta', 'released', 'live'));

-- Authorised administrators (verified via server-controlled app_metadata.role)
-- may view archived/deprecated records and manage the product catalog.
-- Note: user_metadata is intentionally NEVER trusted because users can edit it.
drop policy if exists products_admin_read_all on public.products;
create policy products_admin_read_all
  on public.products
  for select
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert
  on public.products
  for insert
  to authenticated
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

drop policy if exists products_admin_update on public.products;
create policy products_admin_update
  on public.products
  for update
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete
  on public.products
  for delete
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');
