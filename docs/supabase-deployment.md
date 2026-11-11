# Supabase Deployment Procedure (`narendramain`)

## Target Environment

- **Supabase Organization**: `Narendra Software`
- **Central Project**: `narendramain`
- **Migration Path**: `infrastructure/supabase/migrations/0001_create_products_registry.sql`
- **Optional Seed Path**: `infrastructure/supabase/seed.sql`

## Schema Summary (`public.products`)

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key (`gen_random_uuid()`) |
| `name` | `text` | Non-empty display name (1-120 chars) |
| `slug` | `text` | Unique lowercase hyphenated identifier (1-100 chars) |
| `description` | `text` | Non-empty product summary (1-1000 chars) |
| `category` | `text` | Constrained to the 6 ecosystem categories |
| `url` | `text` | Nullable `http://` or `https://` application URL (<= 500 chars; `null` until deployed) |
| `icon_url` | `text` | Optional `https://`, `http://`, or single-slash `/` asset path (<= 500 chars; protocol-relative `//` blocked) |
| `status` | `text` | `planned`, `in-development`, `beta`, `live`, or `archived` |
| `is_featured` | `boolean` | Controls homepage featured placement |
| `sort_order` | `integer` | Non-negative display ordering |
| `created_at` | `timestamptz` | UTC creation timestamp (immutable on `UPDATE`) |
| `updated_at` | `timestamptz` | Auto-updated via trigger |

## Row Level Security (RLS) & Privilege Hardening

- `anon` write privileges are revoked at the table level and only `SELECT` is granted.
- `products_public_read`: Grants `SELECT` to `anon` and `authenticated` for non-archived records (`planned`, `in-development`, `beta`, `live`).
- `products_admin_read_all`, `products_admin_insert`, `products_admin_update`, `products_admin_delete`: Restricted to `authenticated` users whose server-controlled JWT claim `coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'`, or server-side `service_role` calls.
- `user_metadata` is never referenced by RLS because authenticated users can modify their own `user_metadata`.

## Manual Deployment Steps

1. Review `infrastructure/supabase/migrations/0001_create_products_registry.sql`.
2. Link the local repository to `narendramain` using the Supabase CLI:
   ```bash
   supabase login
   supabase link --project-ref <narendramain-project-ref>
   ```
3. Apply migrations:
   ```bash
   supabase db push
   ```
4. Apply `infrastructure/supabase/seed.sql` in the SQL Editor if you want the initial roadmap records seeded.
5. Configure environment variables in `apps/web/portfolio/.env.local` (or your hosting provider):
   - `NEXT_PUBLIC_SUPABASE_URL` (must be `https://...` outside `localhost`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Never expose `SUPABASE_SERVICE_ROLE_KEY` in client bundles or `NEXT_PUBLIC_*` variables.
