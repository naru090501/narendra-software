# Vercel Deployment Guide (Independent Monorepo Projects)

Narendra Software uses a `pnpm` + Turborepo monorepo where each web product deploys as an **independent Vercel Project** from the same Git repository.

## Project 1 — Central Portfolio (`@narendra/portfolio`)

- **Vercel Project Name**: `narendra-portfolio` (or your preferred project name)
- **Root Directory**: `apps/web/portfolio`
- **Framework Preset**: `Next.js`
- **Node.js Version**: `22.x` (or `>= 20.x`)
- **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`
- **Build Command**: `cd ../.. && pnpm turbo run build --filter=@narendra/portfolio`
- **Output Directory**: `.next` (default relative to `apps/web/portfolio`)
- **Config File**: `apps/web/portfolio/vercel.json`

### Environment Variables (`@narendra/portfolio`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended (Production) | Canonical URL used for `metadataBase`, `robots.txt`, and `sitemap.xml` (falls back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` when unset; never emits `localhost` in production). |
| `NEXT_PUBLIC_DEV_TOOLS_URL` | Optional | Production URL of the deployed Developer Toolbox project. Leave unset until Developer Toolbox is deployed. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Public HTTPS URL of the `narendramain` Supabase project. Falls back cleanly to local catalog when omitted. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Public anonymous key for `narendramain`. **Never** expose `SUPABASE_SERVICE_ROLE_KEY`. |

---

## Project 2 — Narendra Developer Toolbox (`@narendra/dev-tools`)

- **Vercel Project Name**: `narendra-dev-tools` (or your preferred project name)
- **Root Directory**: `apps/web/dev-tools`
- **Framework Preset**: `Next.js`
- **Node.js Version**: `22.x` (or `>= 20.x`)
- **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`
- **Build Command**: `cd ../.. && pnpm turbo run build --filter=@narendra/dev-tools`
- **Output Directory**: `.next` (default relative to `apps/web/dev-tools`)
- **Config File**: `apps/web/dev-tools/vercel.json`

### Environment Variables (`@narendra/dev-tools`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended (Production) | Canonical URL used for `metadataBase`, `robots.txt`, and `sitemap.xml` (falls back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` when unset). |
| `NEXT_PUBLIC_PORTFOLIO_URL` | Optional | Production URL of the central Portfolio site for the header link. |

---

## Connecting Both Production URLs After Deployment

1. Deploy `@narendra/dev-tools` first and note its assigned Vercel domain (or custom domain).
2. Deploy `@narendra/portfolio` and set:
   - `NEXT_PUBLIC_SITE_URL` to the Portfolio production URL
   - `NEXT_PUBLIC_DEV_TOOLS_URL` to the Developer Toolbox production URL
3. Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_PORTFOLIO_URL` on `@narendra/dev-tools`, then trigger a redeploy of both projects so canonical metadata, sitemaps, and cross-links update cleanly.
