# Supabase Platform Infrastructure (`narendramain`)

This directory contains SQL migrations and seed scripts for the central **Narendra Software** Supabase project (`narendramain`).

## Security Model

- **Row Level Security (RLS)** is enabled on `public.products`.
- Anonymous (`anon`) and authenticated visitors can read only non-archived product records (`status in ('planned', 'in-development', 'beta', 'live')`).
- Write operations (`INSERT`, `UPDATE`, `DELETE`) and reading `archived` records require `app_metadata.role = 'admin'` in a verified JWT (or server-side `service_role` in trusted administrative tooling).
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code, `NEXT_PUBLIC_*` environment variables, or version control.

## Deployment Procedure (Manual / Reviewed)

Do **not** run destructive or remote database changes automatically without review.

1. Authenticate the Supabase CLI and link to `narendramain`:
   ```bash
   supabase login
   supabase link --project-ref <narendramain-project-ref>
   ```
2. Review the migration SQL in `migrations/0001_create_products_registry.sql`.
3. Push pending migrations to the linked project:
   ```bash
   supabase db push
   ```
4. Optionally apply the idempotent initial catalog seed (`seed.sql`) via the Supabase SQL Editor or `psql` against the target database.
5. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `apps/web/portfolio/.env.local` (or your hosting provider's environment settings).
