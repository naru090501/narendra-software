# Narendra Software

Central monorepo and web portfolio for **Narendra Software**—a personal software project building independent, 100% free, privacy-first web utilities and native .NET 10 Windows applications under one standard.

## Product Ecosystem

- **Developer Toolbox** (`in-development`): Local-first JSON, XML, CSV, Base64, and encoding utilities.
- **Document Tools** (`in-development`): Client-side PDF, Excel, and structured document utilities.
- **Image Tools** (`planned`): Client-side format conversion, resizing, and optimization.
- **Security Tools** (`planned`): Browser-native hashing, verification, and privacy utilities.
- **AI Tools** (`planned`): Selectively AI-powered technical productivity workflows.
- **Windows Utilities** (`planned`): Native .NET 10 desktop tools, including a bootable USB and disk utility.

## Monorepo Structure

```text
apps/
  web/
    portfolio/              # Next.js App Router central portfolio website (@narendra/portfolio)
    dev-tools/              # Standalone Narendra Developer Toolbox app (@narendra/dev-tools)
packages/
  types/                    # Shared TypeScript domain contracts (@narendra/types)
  core/                     # Product catalog fallback, filters, contact validation (@narendra/core)
  supabase/                 # Supabase client & product repository with safe fallback (@narendra/supabase)
  ui/                       # Shared accessible Tailwind CSS + shadcn-style UI primitives (@narendra/ui)
dotnet/                     # Isolated .NET 10 LTS solution (NarendraSoftware.slnx)
infrastructure/
  supabase/
    migrations/             # PostgreSQL schema & RLS migrations for project `narendramain`
docs/                       # Architecture and Supabase deployment docs
.github/workflows/          # CI pipeline
```

## Prerequisites

- **Node.js**: `>= 20` (verified on `v25.2.1`)
- **pnpm**: `>= 10` (verified on `10.34.9`)
- **.NET SDK**: `10.0.x` LTS (for `dotnet/` native Windows workspace)

## Environment Variables

Copy `.env.example` to `apps/web/portfolio/.env.local` (all Supabase variables are optional for local development):

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical base URL for metadata & sitemap (defaults to `http://localhost:3000` for portfolio, `http://localhost:3001` for dev-tools). |
| `NEXT_PUBLIC_DEV_TOOLS_URL` | No | Optional standalone Developer Toolbox URL shown on the portfolio when configured (unset until deployed). |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL for `narendramain`. Falls back to local catalog when omitted. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase public/anon publishable key. **Never** use `service_role` in client env vars. |

## Commands

Run from the repository root (on Windows PowerShell where `.ps1` scripts are restricted, use `pnpm.cmd`):

```bash
# Install all JavaScript/TypeScript workspace dependencies
pnpm install

# Start the central portfolio development server (http://localhost:3000)
pnpm dev:portfolio

# Start the standalone Developer Toolbox development server (http://localhost:3001)
pnpm dev:dev-tools

# Run linting across the monorepo
pnpm lint

# Run strict TypeScript type checking
pnpm typecheck

# Run automated unit tests
pnpm test

# Run production builds
pnpm build
```

Verify the isolated .NET 10 solution separately:

```bash
dotnet sln dotnet/NarendraSoftware.slnx list
```

## Documentation

- [Monorepo Architecture](docs/architecture.md)
- [Native Windows Architecture (.NET 10 LTS)](docs/windows-architecture.md)
- [Supabase Deployment Procedure (`narendramain`)](docs/supabase-deployment.md)
- [Vercel Deployment Guide](docs/deployment-vercel.md)
