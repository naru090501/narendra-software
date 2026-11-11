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
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null,
  description text not null,
  category    text not null,
  url         text,
  icon_url    text,
  status      text not null default 'planned',
  is_featured boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default timezone('utc', now()),
  updated_at  timestamptz not null default timezone('utc', now()),

  constraint products_slug_unique unique (slug),
  constraint products_name_nonempty check (char_length(btrim(name)) between 1 and 120),
  constraint products_description_nonempty check (char_length(btrim(description)) between 1 and 1000),
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
      'in-development',
      'beta',
      'live',
      'archived'
    )
  ),
  constraint products_url_valid check (
    url is null
    or (
      char_length(url) <= 500
      and url ~ '^https?://[A-Za-z0-9.-]+(?::[0-9]+)?(?:/[^\s]*)?$'
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
  where status in ('planned', 'in-development', 'beta', 'live');

create index if not exists idx_products_category_status
  on public.products (category, status);

create index if not exists idx_products_featured
  on public.products (sort_order asc)
  where is_featured = true and status in ('planned', 'in-development', 'beta', 'live');

-- ----------------------------------------------------------------------------
-- 3. Automatic `updated_at` Maintenance & `created_at` Immutability
-- ----------------------------------------------------------------------------
create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.created_at = old.created_at;
  new.updated_at = timezone('utc', now());
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

revoke all on table public.products from anon;
revoke all on table public.products from authenticated;

grant select on table public.products to anon;
grant select, insert, update, delete on table public.products to authenticated;

-- Public visitors (anon + authenticated) may read non-archived product records.
drop policy if exists products_public_read on public.products;
create policy products_public_read
  on public.products
  for select
  to anon, authenticated
  using (status in ('planned', 'in-development', 'beta', 'live'));

-- Authorised administrators (verified via server-controlled app_metadata.role)
-- may view archived records and manage the product catalog.
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
